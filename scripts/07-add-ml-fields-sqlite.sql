-- Add ML classification fields to existing tables (SQLite version)
-- This script adds support for hybrid ML/AI classification tracking

-- Add ML fields to ai_classifications table
ALTER TABLE ai_classifications 
ADD COLUMN classification_source TEXT DEFAULT 'ai';

ALTER TABLE ai_classifications 
ADD COLUMN processing_time_ms INTEGER DEFAULT 0;

ALTER TABLE ai_classifications 
ADD COLUMN ml_confidence REAL;

ALTER TABLE ai_classifications 
ADD COLUMN ai_confidence REAL;

-- Add ML fields to complaints table for quick access
ALTER TABLE complaints 
ADD COLUMN classification_source TEXT DEFAULT 'ai';

ALTER TABLE complaints 
ADD COLUMN classification_confidence REAL;

ALTER TABLE complaints 
ADD COLUMN processing_time_ms INTEGER DEFAULT 0;

-- Create ML predictions tracking table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  model_version TEXT NOT NULL,
  prediction_source TEXT NOT NULL CHECK (prediction_source IN ('ml', 'ai', 'hybrid', 'default')),
  ml_confidence REAL,
  ai_confidence REAL,
  final_confidence REAL,
  processing_time_ms INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Create feedback tracking table
CREATE TABLE IF NOT EXISTS classification_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  prediction_id INTEGER,
  user_corrected_category TEXT,
  user_corrected_priority TEXT,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ml_predictions(id) ON DELETE SET NULL
);

-- Create ML model metadata table
CREATE TABLE IF NOT EXISTS ml_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('category', 'priority', 'sentiment')),
  accuracy REAL,
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default ML model metadata
INSERT INTO ml_models (name, version, model_type, accuracy, is_active) VALUES
('rule-based-classifier', 'v1.0', 'category', 0.75, 1),
('rule-based-classifier', 'v1.0', 'priority', 0.70, 1),
('rule-based-classifier', 'v1.0', 'sentiment', 0.65, 1);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_classification_source ON complaints(classification_source);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_complaint_id ON ml_predictions(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_source ON ml_predictions(prediction_source);
CREATE INDEX IF NOT EXISTS idx_classification_feedback_complaint_id ON classification_feedback(complaint_id);

