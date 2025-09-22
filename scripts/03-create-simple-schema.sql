-- Simplified database schema for complaint management system
USE complaint_management;
GO

-- Drop existing tables if they exist
IF EXISTS (SELECT * FROM sysobjects WHERE name='ai_classifications' AND xtype='U') DROP TABLE ai_classifications;
IF EXISTS (SELECT * FROM sysobjects WHERE name='complaint_status_history' AND xtype='U') DROP TABLE complaint_status_history;
IF EXISTS (SELECT * FROM sysobjects WHERE name='complaint_attachments' AND xtype='U') DROP TABLE complaint_attachments;
IF EXISTS (SELECT * FROM sysobjects WHERE name='complaints' AND xtype='U') DROP TABLE complaints;
IF EXISTS (SELECT * FROM sysobjects WHERE name='complaint_categories' AND xtype='U') DROP TABLE complaint_categories;
IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U') DROP TABLE users;
GO

-- Users table
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
GO

-- Complaint categories
CREATE TABLE complaint_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    color NVARCHAR(7) DEFAULT '#6B7280',
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Insert default categories
INSERT INTO complaint_categories (name, description, color) VALUES
('Waste Management', 'Issues related to garbage collection, disposal, and cleanliness', '#EF4444'),
('Infrastructure', 'Road repairs, streetlights, drainage, and public facilities', '#3B82F6'),
('Noise Disturbance', 'Loud music, construction noise, and other sound-related issues', '#F59E0B'),
('Safety/Security', 'Crime reports, unsafe areas, and security concerns', '#DC2626'),
('Public Health', 'Health hazards, sanitation, and medical emergencies', '#10B981'),
('Other', 'Miscellaneous complaints not covered by other categories', '#6B7280');
GO

-- Complaints table
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
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Add foreign key constraints
ALTER TABLE complaints ADD CONSTRAINT FK_complaints_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE complaints ADD CONSTRAINT FK_complaints_category_id 
    FOREIGN KEY (category_id) REFERENCES complaint_categories(id);
ALTER TABLE complaints ADD CONSTRAINT FK_complaints_assigned_to 
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
GO

-- Create test users
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) VALUES
('admin@barangay.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+63 912 345 6789', 'admin', 'Barangay San Miguel', '123 Admin Street, San Miguel City'),
('official@barangay.com', '3fae19dadf1a05245ffa9cd28f3e4530dc42d16511f743883da4e0f5c70fdc12', 'Juan', 'Dela Cruz', '+63 912 345 6790', 'official', 'Barangay San Miguel', '456 Official Street, San Miguel City'),
('resident@barangay.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'Maria', 'Santos', '+63 912 345 6791', 'resident', 'Barangay San Miguel', '789 Resident Street, San Miguel City');
GO

-- Create indexes
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
GO

PRINT 'Database schema created successfully!';
PRINT 'Test users created:';
PRINT 'Admin: admin@barangay.com / admin123';
PRINT 'Official: official@barangay.com / official123';
PRINT 'Resident: resident@barangay.com / resident123';
