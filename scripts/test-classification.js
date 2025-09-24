const { classifyComplaint } = require('../lib/ai-classifier')

async function testClassification() {
  console.log('🧪 Testing Smart Analysis Classification...\n')

  const testCases = [
    {
      title: "Garbage collection not working",
      description: "The garbage truck hasn't come to our street for 3 days. There's a lot of waste piling up.",
      location: "Barangay San Miguel"
    },
    {
      title: "Road pothole causing accidents",
      description: "There's a big pothole on the main road that's causing vehicles to swerve dangerously.",
      location: "Barangay Apokon"
    },
    {
      title: "Loud music at night",
      description: "Our neighbor plays very loud music every night until 2 AM. We can't sleep.",
      location: "Barangay Magugpo Poblacion"
    },
    {
      title: "Suspicious activity in the area",
      description: "There are suspicious people hanging around the playground at night. We're concerned for children's safety.",
      location: "Barangay Visayan Village"
    }
  ]

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`Test Case ${i + 1}: ${testCase.title}`)
    console.log(`Description: ${testCase.description}`)
    
    try {
      const result = await classifyComplaint(testCase.title, testCase.description, testCase.location)
      
      console.log('✅ Classification Result:')
      console.log(`   Category: ${result.category}`)
      console.log(`   Subcategory: ${result.subcategory}`)
      console.log(`   Priority: ${result.priority}`)
      console.log(`   Urgency Score: ${result.urgency_score}/10`)
      console.log(`   Sentiment: ${result.sentiment}`)
      console.log(`   Department: ${result.suggested_department}`)
      console.log(`   Resolution Time: ${result.estimated_resolution_days} days`)
      console.log(`   Keywords: ${result.keywords.join(', ')}`)
      console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`)
      console.log(`   Source: ${result.source}`)
      console.log('')
      
    } catch (error) {
      console.log('❌ Classification Failed:')
      console.log(`   Error: ${error.message}`)
      console.log('')
    }
  }

  console.log('🎉 Classification test completed!')
}

testClassification().catch(console.error)
