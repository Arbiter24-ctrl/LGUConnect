-- Create database schema for complaint management system

-- Users table (for both residents and officials)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('resident', 'official', 'admin') DEFAULT 'resident',
    barangay VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaint categories
CREATE TABLE IF NOT EXISTS complaint_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO complaint_categories (name, description, color) VALUES
('Waste Management', 'Issues related to garbage collection, disposal, and cleanliness', '#EF4444'),
('Infrastructure', 'Road repairs, streetlights, drainage, and public facilities', '#3B82F6'),
('Noise Disturbance', 'Loud music, construction noise, and other sound-related issues', '#F59E0B'),
('Safety/Security', 'Crime reports, unsafe areas, and security concerns', '#DC2626'),
('Public Health', 'Health hazards, sanitation, and medical emergencies', '#10B981'),
('Other', 'Miscellaneous complaints not covered by other categories', '#6B7280');

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('submitted', 'in_progress', 'resolved', 'closed') DEFAULT 'submitted',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    assigned_to INT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaint attachments (photos/videos)
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Complaint status history for tracking
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    old_status ENUM('submitted', 'in_progress', 'resolved', 'closed'),
    new_status ENUM('submitted', 'in_progress', 'resolved', 'closed') NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- AI classification logs
CREATE TABLE IF NOT EXISTS ai_classifications (
    id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    original_category_id INT,
    ai_suggested_category_id INT NOT NULL,
    ai_suggested_priority ENUM('low', 'medium', 'high') NOT NULL,
    confidence_score DECIMAL(3, 2),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (original_category_id) REFERENCES complaint_categories(id),
    FOREIGN KEY (ai_suggested_category_id) REFERENCES complaint_categories(id)
);

-- Create indexes for better performance
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
CREATE INDEX idx_complaint_status_history_complaint_id ON complaint_status_history(complaint_id);
