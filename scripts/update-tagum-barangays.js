const Database = require('better-sqlite3')
const path = require('path')

// Create SQLite database
const dbPath = path.join(__dirname, '..', 'complaint_management.db')
const db = new Database(dbPath)

console.log('🚀 Updating Tagum City Barangays...\n')

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Clear existing barangays
  db.exec('DELETE FROM barangays')
  console.log('✅ Cleared existing barangays')

  // Insert the actual Tagum City barangays
  const insertBarangay = db.prepare(`
    INSERT INTO barangays (id, name, description, contact_info) 
    VALUES (?, ?, ?, ?)
  `)

  const barangays = [
    [1, 'Apokon', 'Apokon barangay', 'Contact: 0912-345-6789'],
    [2, 'Bincungan', 'Bincungan barangay', 'Contact: 0912-345-6788'],
    [3, 'Busaon', 'Busaon barangay', 'Contact: 0912-345-6787'],
    [4, 'Canocotan', 'Canocotan barangay', 'Contact: 0912-345-6786'],
    [5, 'Cuambogan', 'Cuambogan barangay', 'Contact: 0912-345-6785'],
    [6, 'La Filipina', 'La Filipina barangay', 'Contact: 0912-345-6784'],
    [7, 'Liboganon', 'Liboganon barangay', 'Contact: 0912-345-6783'],
    [8, 'Madaum', 'Madaum barangay', 'Contact: 0912-345-6782'],
    [9, 'Magdum', 'Magdum barangay', 'Contact: 0912-345-6781'],
    [10, 'Mankilam', 'Mankilam barangay', 'Contact: 0912-345-6780'],
    [11, 'New Balamban', 'New Balamban barangay', 'Contact: 0912-345-6779'],
    [12, 'Nueva Fuerza', 'Nueva Fuerza barangay', 'Contact: 0912-345-6778'],
    [13, 'Pagsabangan', 'Pagsabangan barangay', 'Contact: 0912-345-6777'],
    [14, 'Pandapan', 'Pandapan barangay', 'Contact: 0912-345-6776'],
    [15, 'Magugpo Poblacion', 'Magugpo Poblacion barangay', 'Contact: 0912-345-6775'],
    [16, 'San Agustin', 'San Agustin barangay', 'Contact: 0912-345-6774'],
    [17, 'San Isidro', 'San Isidro barangay', 'Contact: 0912-345-6773'],
    [18, 'San Miguel', 'San Miguel barangay', 'Contact: 0912-345-6772'],
    [19, 'Visayan Village', 'Visayan Village barangay', 'Contact: 0912-345-6771'],
    [20, 'Magugpo East', 'Magugpo East barangay', 'Contact: 0912-345-6770'],
    [21, 'Magugpo North', 'Magugpo North barangay', 'Contact: 0912-345-6769'],
    [22, 'Magugpo South', 'Magugpo South barangay', 'Contact: 0912-345-6768'],
    [23, 'Magugpo West', 'Magugpo West barangay', 'Contact: 0912-345-6767']
  ]

  barangays.forEach(barangay => {
    insertBarangay.run(barangay[0], barangay[1], barangay[2], barangay[3])
  })
  console.log('✅ Inserted 23 actual Tagum City barangays')

  // Verify the update
  const result = db.prepare('SELECT COUNT(*) as count FROM barangays').get()
  console.log(`📊 Total barangays in database: ${result.count}`)

  console.log('\n🎉 Barangays updated successfully!')
  console.log('📁 Database location:', dbPath)

} catch (error) {
  console.error('❌ Error updating barangays:', error.message)
} finally {
  db.close()
}
