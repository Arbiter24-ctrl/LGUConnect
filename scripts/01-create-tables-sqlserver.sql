-- Create database schema for complaint management system (SQL Server)

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'complaint_management')
BEGIN
    CREATE DATABASE complaint_management;
END
GO

USE complaint_management;
GO

-- Users table (for both residents and officials)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20),
        role NVARCHAR(20) DEFAULT 'resident' CHECK (role IN ('resident', 'official', 'admin')),
        barangay NVARCHAR(100),
        address NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Complaint categories
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='complaint_categories' AND xtype='U')
BEGIN
    CREATE TABLE complaint_categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX),
        color NVARCHAR(7) DEFAULT '#6B7280',
        created_at DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Insert default categories
IF NOT EXISTS (SELECT * FROM complaint_categories WHERE name = 'Waste Management')
BEGIN
    INSERT INTO complaint_categories (name, description, color) VALUES
    ('Waste Management', 'Issues related to garbage collection, disposal, and cleanliness', '#EF4444'),
    ('Infrastructure', 'Road repairs, streetlights, drainage, and public facilities', '#3B82F6'),
    ('Noise Disturbance', 'Loud music, construction noise, and other sound-related issues', '#F59E0B'),
    ('Safety/Security', 'Crime reports, unsafe areas, and security concerns', '#DC2626'),
    ('Public Health', 'Health hazards, sanitation, and medical emergencies', '#10B981'),
    ('Other', 'Miscellaneous complaints not covered by other categories', '#6B7280');
END
GO

-- Complaints table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='complaints' AND xtype='U')
BEGIN
    CREATE TABLE complaints (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        status NVARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'resolved', 'closed')),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        location_address NVARCHAR(MAX),
        assigned_to INT,
        resolution_notes NVARCHAR(MAX),
        resolved_at DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );
END
GO

-- Complaint attachments (photos/videos)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='complaint_attachments' AND xtype='U')
BEGIN
    CREATE TABLE complaint_attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        complaint_id INT NOT NULL,
        file_path NVARCHAR(500) NOT NULL,
        file_type NVARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'video')),
        file_size INT,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );
END
GO

-- Complaint status history for tracking
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='complaint_status_history' AND xtype='U')
BEGIN
    CREATE TABLE complaint_status_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        complaint_id INT NOT NULL,
        old_status NVARCHAR(20) CHECK (old_status IN ('submitted', 'in_progress', 'resolved', 'closed')),
        new_status NVARCHAR(20) NOT NULL CHECK (new_status IN ('submitted', 'in_progress', 'resolved', 'closed')),
        changed_by INT NOT NULL,
        notes NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id)
    );
END
GO

-- AI classification logs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ai_classifications' AND xtype='U')
BEGIN
    CREATE TABLE ai_classifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        complaint_id INT NOT NULL,
        original_category_id INT,
        ai_suggested_category_id INT NOT NULL,
        ai_suggested_priority NVARCHAR(20) NOT NULL CHECK (ai_suggested_priority IN ('low', 'medium', 'high')),
        confidence_score DECIMAL(3, 2),
        model_version NVARCHAR(50),
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        FOREIGN KEY (original_category_id) REFERENCES complaint_categories(id),
        FOREIGN KEY (ai_suggested_category_id) REFERENCES complaint_categories(id)
    );
END
GO

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaints_user_id')
BEGIN
    CREATE INDEX idx_complaints_user_id ON complaints(user_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaints_category_id')
BEGIN
    CREATE INDEX idx_complaints_category_id ON complaints(category_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaints_status')
BEGIN
    CREATE INDEX idx_complaints_status ON complaints(status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaints_priority')
BEGIN
    CREATE INDEX idx_complaints_priority ON complaints(priority);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaints_created_at')
BEGIN
    CREATE INDEX idx_complaints_created_at ON complaints(created_at);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaint_attachments_complaint_id')
BEGIN
    CREATE INDEX idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_complaint_status_history_complaint_id')
BEGIN
    CREATE INDEX idx_complaint_status_history_complaint_id ON complaint_status_history(complaint_id);
END
GO

PRINT 'Database schema created successfully!';
