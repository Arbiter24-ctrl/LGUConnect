-- Add ML classification fields to existing tables
-- This script adds support for hybrid ML/AI classification tracking

-- Add ML fields to ai_classifications table
ALTER TABLE ai_classifications 
ADD COLUMN IF NOT EXISTS classification_source VARCHAR(20) DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS processing_time_ms INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ml_confidence DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(5,4);

-- Add ML fields to complaints table for quick access
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS classification_source VARCHAR(20) DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS classification_confidence DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS processing_time_ms INT DEFAULT 0;

-- Create ML predictions tracking table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  prediction_source ENUM('ml', 'ai', 'hybrid', 'default') NOT NULL,
  ml_confidence DECIMAL(5,4),
  ai_confidence DECIMAL(5,4),
  final_confidence DECIMAL(5,4),
  processing_time_ms INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Create feedback tracking table
CREATE TABLE IF NOT EXISTS classification_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  prediction_id INT,
  user_corrected_category VARCHAR(100),
  user_corrected_priority VARCHAR(20),
  feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ml_predictions(id) ON DELETE SET NULL
);

-- Create ML model metadata table
CREATE TABLE IF NOT EXISTS ml_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL,
  model_type ENUM('category', 'priority', 'sentiment') NOT NULL,
  accuracy DECIMAL(5,4),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default ML model metadata
INSERT INTO ml_models (name, version, model_type, accuracy, is_active) VALUES
('rule-based-classifier', 'v1.0', 'category', 0.75, TRUE),
('rule-based-classifier', 'v1.0', 'priority', 0.70, TRUE),
('rule-based-classifier', 'v1.0', 'sentiment', 0.65, TRUE);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_complaints_classification_source ON complaints(classification_source);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_complaint_id ON ml_predictions(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_source ON ml_predictions(prediction_source);
CREATE INDEX IF NOT EXISTS idx_classification_feedback_complaint_id ON classification_feedback(complaint_id);

