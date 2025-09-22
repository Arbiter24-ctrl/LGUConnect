-- Create test users for the complaint management system
USE complaint_management;
GO

-- Create test users with different roles
-- Note: Passwords are hashed using SHA-256. The actual passwords are:
-- admin123, official123, resident123

-- Admin user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@barangay.com')
BEGIN
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
    VALUES (
        'admin@barangay.com',
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- admin123
        'Admin',
        'User',
        '+63 912 345 6789',
        'admin',
        'Barangay San Miguel',
        '123 Admin Street, San Miguel City'
    );
END
GO

-- Official user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'official@barangay.com')
BEGIN
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
    VALUES (
        'official@barangay.com',
        '3fae19dadf1a05245ffa9cd28f3e4530dc42d16511f743883da4e0f5c70fdc12', -- official123
        'Juan',
        'Dela Cruz',
        '+63 912 345 6790',
        'official',
        'Barangay San Miguel',
        '456 Official Street, San Miguel City'
    );
END
GO

-- Resident user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'resident@barangay.com')
BEGIN
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
    VALUES (
        'resident@barangay.com',
        '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', -- resident123
        'Maria',
        'Santos',
        '+63 912 345 6791',
        'resident',
        'Barangay San Miguel',
        '789 Resident Street, San Miguel City'
    );
END
GO

PRINT 'Test users created successfully!';
PRINT 'Admin: admin@barangay.com / admin123';
PRINT 'Official: official@barangay.com / official123';
PRINT 'Resident: resident@barangay.com / resident123';
