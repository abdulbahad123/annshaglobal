import Staff from '../models/Staff.js';
import fs from 'fs';
import path from 'path';

const staffJsonPath = path.join(process.cwd(), 'data', 'staff.json');

// Helper to read fallback json
const readStaffJson = () => {
  try {
    if (fs.existsSync(staffJsonPath)) {
      const raw = fs.readFileSync(staffJsonPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading staff.json:', err);
  }
  return [];
};

// Helper to write fallback json
const writeStaffJson = (data) => {
  try {
    const dir = path.dirname(staffJsonPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(staffJsonPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing staff.json:', err);
  }
};

// @desc    Get all staff members (with search, role, status filtering)
// @route   GET /api/v1/staff
export const getAllStaff = async (req, res) => {
  try {
    const { search, role, status, sort } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'All') {
      query.role = role;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    let staffList = [];
    try {
      staffList = await Staff.find(query).sort({ createdAt: -1 });
    } catch (dbErr) {
      console.warn('MongoDB staff find failed, using fallback:', dbErr.message);
    }

    // If database returned empty or failed, load fallback and auto-seed MongoDB
    if (!staffList || staffList.length === 0) {
      const fallbackList = readStaffJson();
      if (fallbackList && fallbackList.length > 0) {
        // Try to insert fallback items into MongoDB if connected
        try {
          const count = await Staff.countDocuments();
          if (count === 0) {
            await Staff.insertMany(fallbackList.map(s => {
              const { _id, ...rest } = s;
              return rest;
            }));
            staffList = await Staff.find(query).sort({ createdAt: -1 });
          }
        } catch (seedErr) {
          console.warn('Could not seed staff to MongoDB:', seedErr.message);
        }

        if (!staffList || staffList.length === 0) {
          staffList = fallbackList.filter(s => {
            if (search) {
              const q = search.toLowerCase();
              const mName = s.name?.toLowerCase().includes(q);
              const mEmail = s.email?.toLowerCase().includes(q);
              const mPhone = s.phone?.toLowerCase().includes(q);
              if (!mName && !mEmail && !mPhone) return false;
            }
            if (role && role !== 'All' && s.role !== role) return false;
            if (status && status !== 'All' && s.status !== status) return false;
            return true;
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: staffList.length,
      staff: staffList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch staff members'
    });
  }
};

// @desc    Get single staff member by ID
// @route   GET /api/v1/staff/:id
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    let member = null;

    try {
      member = await Staff.findById(id);
    } catch (e) {
      // not a valid ObjectId or DB offline
    }

    if (!member) {
      const list = readStaffJson();
      member = list.find(s => s._id === id || String(s.id) === id);
    }

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      staff: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch staff member'
    });
  }
};

// @desc    Create new staff member
// @route   POST /api/v1/staff
export const createStaff = async (req, res) => {
  try {
    const { name, email, role, department, phone, permissions, status, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Staff member name and email are required'
      });
    }

    let existing = null;
    try {
      existing = await Staff.findOne({ email: email.toLowerCase().trim() });
    } catch (e) {}

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A staff member with this email already exists'
      });
    }

    let newStaff = null;
    try {
      newStaff = await Staff.create({
        name,
        email: email.toLowerCase().trim(),
        role: role || 'Store Manager',
        department: department || 'Operations',
        phone: phone || '',
        permissions: Array.isArray(permissions) ? permissions : ['products', 'orders'],
        status: status || 'active',
        notes: notes || ''
      });
    } catch (dbErr) {
      console.warn('MongoDB staff create failed, writing to JSON:', dbErr.message);
    }

    // Always sync with JSON dual storage
    const list = readStaffJson();
    const createdItem = newStaff ? newStaff.toObject() : {
      _id: 'staff_' + Date.now(),
      name,
      email: email.toLowerCase().trim(),
      role: role || 'Store Manager',
      department: department || 'Operations',
      phone: phone || '',
      permissions: Array.isArray(permissions) ? permissions : ['products', 'orders'],
      status: status || 'active',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(createdItem);
    writeStaffJson(list);

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staff: newStaff || createdItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create staff member'
    });
  }
};

// @desc    Update staff member details
// @route   PUT /api/v1/staff/:id
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    let updatedStaff = null;
    try {
      updatedStaff = await Staff.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
    } catch (e) {}

    // Sync JSON fallback
    const list = readStaffJson();
    const idx = list.findIndex(s => s._id === id || String(s.id) === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData, updatedAt: new Date().toISOString() };
      writeStaffJson(list);
      if (!updatedStaff) updatedStaff = list[idx];
    }

    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found to update'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update staff member'
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/v1/staff/:id
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await Staff.findByIdAndDelete(id);
    } catch (e) {}

    // Sync JSON fallback
    const list = readStaffJson();
    const filtered = list.filter(s => s._id !== id && String(s.id) !== id);
    writeStaffJson(filtered);

    res.status(200).json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete staff member'
    });
  }
};

// @desc    Toggle staff active / suspended status
// @route   PATCH /api/v1/staff/:id/status
export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let member = null;

    try {
      member = await Staff.findById(id);
      if (member) {
        member.status = member.status === 'active' ? 'suspended' : 'active';
        await member.save();
      }
    } catch (e) {}

    const list = readStaffJson();
    const idx = list.findIndex(s => s._id === id || String(s.id) === id);
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'active' ? 'suspended' : 'active';
      writeStaffJson(list);
      if (!member) member = list[idx];
    }

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Staff member marked as ${member.status}`,
      staff: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle status'
    });
  }
};

