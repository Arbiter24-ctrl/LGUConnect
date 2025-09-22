# SQL Server Database Setup Guide

## ✅ SQL Server Configuration Complete!

Your complaint management system is now configured to use **SQL Server Express** instead of MySQL.

## 🔧 What's Been Done

1. **Installed SQL Server Driver** - Added `mssql` package for Node.js
2. **Updated Database Configuration** - Modified `lib/db.ts` for SQL Server
3. **Created SQL Server Schema** - `scripts/01-create-tables-sqlserver.sql`
4. **Updated Environment Variables** - Configured for SQL Server connection

## 🚀 Next Steps

### 1. Set Your SQL Server Password
Edit `.env.local` and update the password:
```env
DB_PASSWORD=your_actual_sql_server_password
```

### 2. Create the Database
Run the SQL script in SQL Server Management Studio (SSMS) or sqlcmd:

**Option A: Using SSMS**
1. Open SQL Server Management Studio
2. Connect to your SQL Server Express instance
3. Open and run: `scripts/01-create-tables-sqlserver.sql`

**Option B: Using sqlcmd (Command Line)**
```bash
sqlcmd -S localhost\SQLEXPRESS -i scripts/01-create-tables-sqlserver.sql
```

### 3. Test the Connection
The system will automatically create the database and tables when you first run it.

## 📊 Database Schema

The following tables will be created:
- **users** - User accounts (residents, officials, admins)
- **complaint_categories** - Complaint types (Waste, Infrastructure, etc.)
- **complaints** - Main complaint records
- **complaint_attachments** - File attachments
- **complaint_status_history** - Status change tracking
- **ai_classifications** - AI analysis results

## 🔐 Default Data

The system will automatically insert default complaint categories:
- Waste Management
- Infrastructure  
- Noise Disturbance
- Safety/Security
- Public Health
- Other

## 🛠️ Connection Details

**SQL Server Configuration:**
- **Server**: localhost (or your server name)
- **Port**: 1433
- **Database**: complaint_management
- **Authentication**: SQL Server Authentication
- **User**: sa (or your preferred user)

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check if SQL Server Express is running
   - Verify the port (1433) is open
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password in `.env.local`
   - Check if SQL Server Authentication is enabled
   - Try Windows Authentication if available

3. **Database Not Found**
   - The script will create the database automatically
   - Check SQL Server permissions

### Check SQL Server Status:
```powershell
Get-Service | Where-Object {$_.Name -like "*sql*"}
```

## 🎯 Testing the Setup

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Visit**: http://localhost:3000

3. **Register a User**: Create your first account

4. **Submit a Complaint**: Test the full workflow

## 📝 Environment Variables

Your `.env.local` should contain:
```env
# Database Configuration (SQL Server)
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_sql_server_password
DB_NAME=complaint_management
DB_CONNECTION_LIMIT=10

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# AI Configuration (Optional)
GROQ_API_KEY=your_groq_api_key_here
XAI_API_KEY=your_xai_api_key_here

# Application Configuration
NODE_ENV=development
```

## 🎉 You're Ready!

Your complaint management system is now configured for **SQL Server** and ready to use!

**Start the application**: `npm run dev`
**Access the system**: http://localhost:3000
