# Comprehensive cPanel & MongoDB Atlas Deployment Guide
**Target Domain:** `annshagifts.nooryak.com`  
**cPanel Document Root:** `/home/bazaarwa/annshagifts.nooryak.com`  
**GitHub Repository:** `https://github.com/abdulbahad123/annshaglobal.git`

---

## Part 1: Free MongoDB Atlas Cluster Setup

1. **Sign Up / Log In**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas).
   - Sign up or log into your account.

2. **Create a Free Cluster**:
   - Click **"Create Database"** or **"Build a Database"**.
   - Choose the **M0 Free** tier (Shared).
   - Select cloud provider **AWS** and choose the nearest region (e.g., `ap-south-1` Mumbai).
   - Keep the Cluster Name as `Cluster0` or name it `annshaglobal`.
   - Click **"Create Deployment"**.

3. **Create Database Credentials**:
   - In the Quickstart prompt:
     - **Username**: `annsha_admin`
     - **Password**: Generate a secure password (e.g. `AnnshaPass2026!#` — save this in your notes!).
     - Click **"Create Database User"**.

4. **Configure IP Access List (Whitelist)**:
   - Under **"Where would you like to connect from?"**, select **"Cloud Environment"** or navigate to **Network Access** in the left sidebar.
   - Click **"Add IP Address"**.
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
     *(This is required for cPanel shared hosting because outgoing server IPs can rotate).*
   - Click **"Confirm"**.

5. **Get the Connection String**:
   - Navigate to **Databases** > click **"Connect"**.
   - Select **"Drivers"** (Node.js).
   - Copy the connection URI:
     ```env
     mongodb+srv://annsha_admin:<password>@cluster0.xxxxx.mongodb.net/annshaglobal?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with the actual password you created in Step 3.

---

## Part 2: cPanel Node.js Backend Deployment

1. **Access cPanel**:
   - Log into your cPanel dashboard (`s3508.bom1.stableserver.net:2083`).

2. **Open "Setup Node.js App"**:
   - Under the **Software** section, click **"Setup Node.js App"**.
   - Click the blue **"Create Application"** button.

3. **Configure Application Settings**:
   - **Node.js version**: Choose `18.x` or `20.x` (LTS).
   - **Application mode**: `Production`.
   - **Application root**: `backend` (this creates a folder `/home/bazaarwa/backend`).
   - **Application URL**: `annshagifts.nooryak.com/api` (or a dedicated subdomain / port).
   - **Application startup file**: `server.js`.
   - Click **"Create"**.

4. **Upload Backend Files**:
   - Open cPanel **File Manager** and go to `/home/bazaarwa/backend`.
   - Upload all files from the `server/` directory of this project:
     - `server.js`
     - `package.json`
     - `seed.js`
     - `models/` folder
     - `routes/` folder
     - `middlewares/` folder
     - `services/` folder
     - `utils/` folder
     - `uploads/` folder (with all product & category images)
   *(Do NOT upload `node_modules` — cPanel will install them).*

5. **Set Environment Variables in cPanel Node.js App**:
   - In **Setup Node.js App**, scroll down to **"Environment variables"** and click **"Add Variable"**:
     - `MONGO_URI` = `mongodb+srv://annsha_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/annshaglobal?retryWrites=true&w=majority`
     - `NODE_ENV` = `production`
     - `PORT` = `5000` (or leave default assigned by Phusion Passenger)
     - `JWT_ACCESS_SECRET` = `annsha_jwt_secret_key_prod_2026`
     - `JWT_REFRESH_SECRET` = `annsha_refresh_secret_key_prod_2026`
     - `CORS_ORIGIN` = `https://annshagifts.nooryak.com`
   - Click **"Save"**.

6. **Run NPM Install**:
   - In the Node.js App manager, click **"Run NPM Install"**.
   - Wait until it shows packages installed successfully.
   - Click **"Restart"** button to start the backend.

7. **Seed the Database (Optional / Initial Run)**:
   - In cPanel **Terminal** (or SSH), run:
     ```bash
     source /home/bazaarwa/nodevenv/backend/18/bin/activate && cd /home/bazaarwa/backend
     node seed.js
     ```
   - All default luxury products, categories, CMS content, and admin accounts will be seeded directly into your MongoDB Atlas cluster!

---

## Part 3: cPanel React Frontend Deployment

1. **Locate the Client Build**:
   - The production build is compiled and ready inside `client/dist/`.
   - Contains:
     - `index.html`
     - `assets/` (bundled JS, CSS, and optimized WebP images)
     - `images/` (storefront luxury banner assets)

2. **Upload to cPanel Document Root**:
   - In cPanel **File Manager**, navigate to the document root:
     `/home/bazaarwa/annshagifts.nooryak.com/`
     *(or `public_html` if that is your main root)*.
   - Delete any placeholder `default.html` or `index.html`.
   - Upload the files and folders from inside `client/dist/` directly into `/home/bazaarwa/annshagifts.nooryak.com/`.

3. **Configure SPA Routing with `.htaccess`**:
   - In `/home/bazaarwa/annshagifts.nooryak.com/`, make sure hidden files are enabled (Settings > Show Hidden Files).
   - Create or edit `.htaccess` and paste:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /

       # Forward /api requests to backend if running on same domain
       RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
       RewriteRule ^uploads/(.*)$ http://127.0.0.1:5000/uploads/$1 [P,L]

       # React SPA catch-all
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_FILENAME} !-l
       RewriteRule . /index.html [L]
     </IfModule>

     <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript
     </IfModule>
     ```
   - Click **Save Changes**.

---

## Part 4: Verification Checklist

1. **Frontend**:
   - Visit `https://annshagifts.nooryak.com/`
   - Hero banner, category backgrounds, brand logos, and dual footer CTA banners load pixel-perfect.
2. **Shop Page**:
   - Visit `https://annshagifts.nooryak.com/shop`
   - Full cover hero banner displays seamlessly.
3. **Product Page**:
   - Visit `https://annshagifts.nooryak.com/product/stylish-handbag`
   - Left gallery matches right column height; single-line breadcrumb on mobile.
4. **Admin Panel**:
   - Visit `https://annshagifts.nooryak.com/admin`
   - Login: `admin@annshaglobal.com` / `admin123`
   - Edit products at `/admin/product/:id`, categories at `/admin/category/:id`, and variations under "Variation by Category".

