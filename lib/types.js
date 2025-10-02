/**
 * Type definitions for the complaint management system
 * 
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [phone]
 * @property {"resident"|"official"|"admin"} role
 * @property {string} [barangay]
 * @property {string} [address]
 * @property {string} created_at
 * @property {string} updated_at
 * 
 * @typedef {Object} ComplaintCategory
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} color
 * @property {string} created_at
 * 
 * @typedef {Object} Complaint
 * @property {number} id
 * @property {number} user_id
 * @property {number} category_id
 * @property {string} title
 * @property {string} description
 * @property {"low"|"medium"|"high"} priority
 * @property {"submitted"|"in_progress"|"resolved"|"closed"} status
 * @property {number} [location_lat]
 * @property {number} [location_lng]
 * @property {string} [location_address]
 * @property {number} [assigned_to]
 * @property {string} [resolution_notes]
 * @property {string} [resolved_at]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {ComplaintCategory} [category]
 * @property {User} [user]
 * @property {User} [assigned_official]
 * @property {ComplaintAttachment[]} [attachments]
 * 
 * @typedef {Object} ComplaintAttachment
 * @property {number} id
 * @property {number} complaint_id
 * @property {string} file_path
 * @property {"image"|"video"} file_type
 * @property {number} [file_size]
 * @property {string} created_at
 * 
 * @typedef {Object} ComplaintStatusHistory
 * @property {number} id
 * @property {number} complaint_id
 * @property {string} [old_status]
 * @property {string} new_status
 * @property {number} changed_by
 * @property {string} [notes]
 * @property {string} created_at
 * @property {User} [changed_by_user]
 * 
 * @typedef {Object} AIClassification
 * @property {number} id
 * @property {number} complaint_id
 * @property {number} [original_category_id]
 * @property {number} ai_suggested_category_id
 * @property {"low"|"medium"|"high"} ai_suggested_priority
 * @property {number} [confidence_score]
 * @property {string} [model_version]
 * @property {string} created_at
 * 
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [message]
 * @property {string} [error]
 * 
 * @typedef {Object} ComplaintStats
 * @property {number} total
 * @property {number} submitted
 * @property {number} in_progress
 * @property {number} resolved
 * @property {number} closed
 * @property {Array<{category: string, count: number, color: string}>} by_category
 * @property {Array<{priority: string, count: number}>} by_priority
 * @property {Array<{date: string, count: number}>} recent_trends
 */

// Export empty object to maintain module structure
const types = {};

export default types;
