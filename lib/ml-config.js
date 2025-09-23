// ML Configuration for hybrid classification system
export const ML_CONFIG = {
  // Confidence thresholds
  HIGH_CONFIDENCE_THRESHOLD: 0.8,
  MEDIUM_CONFIDENCE_THRESHOLD: 0.6,
  LOW_CONFIDENCE_THRESHOLD: 0.4,
  
  // Model settings
  MODEL_VERSION: 'v1.0',
  MODEL_PATH: './ml/models/',
  
  // Fallback settings
  ENABLE_AI_FALLBACK: true,
  ENABLE_ENSEMBLE: true,
  
  // Performance settings
  ML_TIMEOUT_MS: 2000,
  AI_TIMEOUT_MS: 5000,
  
  // Monitoring
  LOG_PREDICTIONS: true,
  TRACK_PERFORMANCE: true,
  
  // Categories for ML training
  CATEGORIES: [
    'Waste Management',
    'Infrastructure', 
    'Noise Disturbance',
    'Safety/Security',
    'Public Health',
    'Administrative',
    'Other'
  ],
  
  // Priority levels
  PRIORITIES: ['low', 'medium', 'high', 'urgent'],
  
  // Sentiment analysis
  SENTIMENTS: ['positive', 'neutral', 'negative']
}

