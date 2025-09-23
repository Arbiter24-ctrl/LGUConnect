-- Add anonymous submission fields to complaints table
-- Add barangay_id field to complaints table

-- Add barangay_id column
ALTER TABLE complaints ADD COLUMN barangay_id INTEGER;

-- Add anonymous contact fields
ALTER TABLE complaints ADD COLUMN anonymous_name VARCHAR(255);
ALTER TABLE complaints ADD COLUMN anonymous_email VARCHAR(255);
ALTER TABLE complaints ADD COLUMN anonymous_phone VARCHAR(50);

-- Create barangays table if it doesn't exist
CREATE TABLE IF NOT EXISTS barangays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Tagum City barangays
INSERT OR IGNORE INTO barangays (id, name, description, contact_info) VALUES
(1, 'Apokon', 'Apokon barangay', 'Contact: 0912-345-6789'),
(2, 'Bincungan', 'Bincungan barangay', 'Contact: 0912-345-6788'),
(3, 'Busaon', 'Busaon barangay', 'Contact: 0912-345-6787'),
(4, 'Canocotan', 'Canocotan barangay', 'Contact: 0912-345-6786'),
(5, 'Cuambogan', 'Cuambogan barangay', 'Contact: 0912-345-6785'),
(6, 'La Filipina', 'La Filipina barangay', 'Contact: 0912-345-6784'),
(7, 'Liboganon', 'Liboganon barangay', 'Contact: 0912-345-6783'),
(8, 'Madaum', 'Madaum barangay', 'Contact: 0912-345-6782'),
(9, 'Magdum', 'Magdum barangay', 'Contact: 0912-345-6781'),
(10, 'Mankilam', 'Mankilam barangay', 'Contact: 0912-345-6780'),
(11, 'New Balamban', 'New Balamban barangay', 'Contact: 0912-345-6779'),
(12, 'Nueva Fuerza', 'Nueva Fuerza barangay', 'Contact: 0912-345-6778'),
(13, 'Pagsabangan', 'Pagsabangan barangay', 'Contact: 0912-345-6777'),
(14, 'Pandapan', 'Pandapan barangay', 'Contact: 0912-345-6776'),
(15, 'Magugpo Poblacion', 'Magugpo Poblacion barangay', 'Contact: 0912-345-6775'),
(16, 'San Agustin', 'San Agustin barangay', 'Contact: 0912-345-6774'),
(17, 'San Isidro', 'San Isidro barangay', 'Contact: 0912-345-6773'),
(18, 'San Miguel', 'San Miguel barangay', 'Contact: 0912-345-6772'),
(19, 'Visayan Village', 'Visayan Village barangay', 'Contact: 0912-345-6771'),
(20, 'Magugpo East', 'Magugpo East barangay', 'Contact: 0912-345-6770'),
(21, 'Magugpo North', 'Magugpo North barangay', 'Contact: 0912-345-6769'),
(22, 'Magugpo South', 'Magugpo South barangay', 'Contact: 0912-345-6768'),
(23, 'Magugpo West', 'Magugpo West barangay', 'Contact: 0912-345-6767');

-- Add foreign key constraint for barangay_id
-- Note: SQLite doesn't enforce foreign key constraints by default
-- This is for documentation purposes
-- FOREIGN KEY (barangay_id) REFERENCES barangays(id)
