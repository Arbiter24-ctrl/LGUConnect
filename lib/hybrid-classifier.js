// Hybrid classifier that combines ML and AI approaches
import { mlClassifier } from './ml-classifier'
import { classifyComplaint as aiClassify } from './ai-classifier'
import { ML_CONFIG } from './ml-config'

export async function classifyComplaint(title, description, location = null) {
  const text = `${title} ${description}`
  const startTime = Date.now()
  
  console.log('Starting hybrid classification...')
  
  // 1. Try ML first (fast path)
  try {
    const mlResult = await mlClassifier.predict(text)
    
    // High confidence ML prediction - use it directly
    if (mlResult.confidence >= ML_CONFIG.HIGH_CONFIDENCE_THRESHOLD) {
      console.log(`Using ML prediction (high confidence: ${Math.round(mlResult.confidence * 100)}%)`)
      return {
        ...mlResult,
        source: 'ml',
        processing_time: Date.now() - startTime
      }
    }
    
    // Medium confidence - try ensemble approach
    if (mlResult.confidence >= ML_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD && ML_CONFIG.ENABLE_ENSEMBLE) {
      console.log(`Using ML + AI ensemble (ML confidence: ${Math.round(mlResult.confidence * 100)}%)`)
      
      try {
        const aiResult = await aiClassify(title, description, location)
        const ensembleResult = combinePredictions(mlResult, aiResult)
        
        return {
          ...ensembleResult,
          source: 'hybrid',
          processing_time: Date.now() - startTime
        }
      } catch (aiError) {
        console.log('AI ensemble failed, using ML result:', aiError.message)
        return {
          ...mlResult,
          source: 'ml',
          processing_time: Date.now() - startTime
        }
      }
    }
    
    // Low confidence ML - fall back to AI
    console.log(`ML confidence too low (${Math.round(mlResult.confidence * 100)}%), using AI fallback`)
    
  } catch (mlError) {
    console.log('ML failed, using AI fallback:', mlError.message)
  }
  
  // 2. AI fallback for low confidence or ML failure
  if (ML_CONFIG.ENABLE_AI_FALLBACK) {
    try {
      const aiResult = await aiClassify(title, description, location)
      return {
        ...aiResult,
        source: 'ai',
        processing_time: Date.now() - startTime
      }
    } catch (aiError) {
      console.error('Both ML and AI failed:', aiError)
      // Return default classification
      return getDefaultClassification(title, description, startTime)
    }
  }
  
  // Final fallback
  return getDefaultClassification(title, description, startTime)
}

function combinePredictions(mlResult, aiResult) {
  // Simple ensemble: use ML for category, AI for priority and sentiment
  return {
    category: mlResult.category,
    subcategory: mlResult.subcategory,
    priority: aiResult.priority || mlResult.priority,
    urgency_score: aiResult.urgency_score || mlResult.urgency_score,
    sentiment: aiResult.sentiment || mlResult.sentiment,
    keywords: [...new Set([...mlResult.keywords, ...(aiResult.keywords || [])])].slice(0, 5),
    suggested_department: aiResult.suggested_department || mlResult.suggested_department,
    estimated_resolution_days: aiResult.estimated_resolution_days || mlResult.estimated_resolution_days,
    confidence: (mlResult.confidence + (aiResult.confidence || 0.8)) / 2,
    ml_confidence: mlResult.confidence,
    ai_confidence: aiResult.confidence || 0.8
  }
}

function getDefaultClassification(title, description, startTime) {
  return {
    category: 'Administrative',
    subcategory: 'General',
    priority: 'medium',
    urgency_score: 5,
    sentiment: 'neutral',
    keywords: [title.split(' ')[0] || 'complaint'],
    suggested_department: 'Administrative Office',
    estimated_resolution_days: 7,
    confidence: 0.5,
    source: 'default',
    processing_time: Date.now() - startTime
  }
}

// Export for backward compatibility
export { classifyComplaint as classifyComplaintHybrid }

