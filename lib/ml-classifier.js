// Simple ML classifier using rule-based approach initially
// This can be replaced with actual ML models later
import { ML_CONFIG } from './ml-config'

class MLClassifier {
  constructor() {
    this.initialized = false
    this.modelVersion = ML_CONFIG.MODEL_VERSION
  }

  async initialize() {
    try {
      // For now, we'll use rule-based classification
      // In production, this would load actual ML models
      console.log('ML Classifier initialized with rule-based approach')
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize ML classifier:', error)
      throw error
    }
  }

  async predict(text) {
    if (!this.initialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    
    try {
      // Rule-based classification (replace with actual ML model)
      const classification = this.ruleBasedClassification(text)
      
      const processingTime = Date.now() - startTime
      
      return {
        category: classification.category,
        subcategory: classification.subcategory,
        priority: classification.priority,
        urgency_score: classification.urgency_score,
        sentiment: classification.sentiment,
        keywords: classification.keywords,
        suggested_department: classification.suggested_department,
        estimated_resolution_days: classification.estimated_resolution_days,
        confidence: classification.confidence,
        processing_time: processingTime,
        model_version: this.modelVersion,
        source: 'ml'
      }
    } catch (error) {
      console.error('ML prediction failed:', error)
      throw error
    }
  }

  ruleBasedClassification(text) {
    const lowerText = text.toLowerCase()
    
    // Category classification based on keywords
    let category = 'Other'
    let subcategory = 'General'
    let confidence = 0.7 // Base confidence for rule-based
    
    if (lowerText.includes('garbage') || lowerText.includes('waste') || lowerText.includes('trash')) {
      category = 'Waste Management'
      subcategory = 'Garbage Collection'
      confidence = 0.9
    } else if (lowerText.includes('road') || lowerText.includes('street') || lowerText.includes('pothole')) {
      category = 'Infrastructure'
      subcategory = 'Road Maintenance'
      confidence = 0.85
    } else if (lowerText.includes('noise') || lowerText.includes('loud') || lowerText.includes('music')) {
      category = 'Noise Disturbance'
      subcategory = 'Loud Music'
      confidence = 0.8
    } else if (lowerText.includes('crime') || lowerText.includes('safety') || lowerText.includes('security')) {
      category = 'Safety/Security'
      subcategory = 'Crime Report'
      confidence = 0.9
    } else if (lowerText.includes('health') || lowerText.includes('sanitation') || lowerText.includes('disease')) {
      category = 'Public Health'
      subcategory = 'Health Hazard'
      confidence = 0.85
    }
    
    // Priority classification
    let priority = 'medium'
    let urgency_score = 5
    
    if (lowerText.includes('urgent') || lowerText.includes('emergency') || lowerText.includes('immediate')) {
      priority = 'urgent'
      urgency_score = 9
    } else if (lowerText.includes('high') || lowerText.includes('serious') || lowerText.includes('dangerous')) {
      priority = 'high'
      urgency_score = 7
    } else if (lowerText.includes('low') || lowerText.includes('minor') || lowerText.includes('small')) {
      priority = 'low'
      urgency_score = 3
    }
    
    // Sentiment analysis
    let sentiment = 'neutral'
    if (lowerText.includes('thank') || lowerText.includes('appreciate') || lowerText.includes('good')) {
      sentiment = 'positive'
    } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('terrible')) {
      sentiment = 'negative'
    }
    
    // Extract keywords
    const keywords = this.extractKeywords(text)
    
    // Department suggestion
    const departmentMap = {
      'Waste Management': 'Environmental Office',
      'Infrastructure': 'Engineering Department',
      'Noise Disturbance': 'Public Safety Office',
      'Safety/Security': 'Public Safety Office',
      'Public Health': 'Health Office',
      'Administrative': 'Administrative Office',
      'Other': 'Administrative Office'
    }
    
    const suggested_department = departmentMap[category] || 'Administrative Office'
    
    // Resolution time estimation
    const resolutionDays = priority === 'urgent' ? 1 : priority === 'high' ? 3 : priority === 'medium' ? 7 : 14
    
    return {
      category,
      subcategory,
      priority,
      urgency_score,
      sentiment,
      keywords,
      suggested_department,
      estimated_resolution_days: resolutionDays,
      confidence
    }
  }

  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    // Simple keyword extraction (replace with proper NLP)
    const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'come', 'here', 'just', 'into', 'over', 'think', 'back', 'even', 'before', 'never', 'under', 'while', 'might', 'still', 'should', 'being', 'every', 'great', 'those', 'through', 'during', 'without', 'before', 'right', 'means', 'told', 'looked', 'called', 'asked', 'needed', 'felt', 'seemed', 'left', 'right', 'took', 'came', 'made', 'went', 'saw', 'got', 'put', 'found', 'gave', 'told', 'asked', 'worked', 'called', 'tried', 'hand', 'home', 'made', 'part', 'point', 'place', 'right', 'again', 'before', 'move', 'right', 'back', 'much', 'good', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'years', 'live', 'me', 'back', 'give', 'most', 'very', 'good', 'much', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'years', 'live', 'me', 'back', 'give', 'most']
    
    return words
      .filter(word => !commonWords.includes(word))
      .slice(0, 5)
  }
}

export const mlClassifier = new MLClassifier()

