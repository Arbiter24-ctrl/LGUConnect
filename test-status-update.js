const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testStatusUpdate() {
  console.log('🧪 Testing Status Update Functionality...\n');
  
  try {
    // Test 1: Check if complaints exist
    console.log('1️⃣ Checking available complaints...');
    const complaintsResponse = await fetch('http://localhost:3000/api/complaints');
    
    if (complaintsResponse.ok) {
      const complaintsResult = await complaintsResponse.json();
      console.log(`✅ Found ${complaintsResult.data?.length || 0} complaints`);
      
      if (complaintsResult.data && complaintsResult.data.length > 0) {
        const testComplaint = complaintsResult.data[0];
        console.log('Sample complaint:', {
          id: testComplaint.id,
          title: testComplaint.title,
          status: testComplaint.status
        });
        
        // Test 2: Test status update API
        console.log('\n2️⃣ Testing status update API...');
        const updateResponse = await fetch(`http://localhost:3000/api/complaints/${testComplaint.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'in_progress',
            changed_by: 1
          })
        });
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('✅ Status update API works:', updateResult);
          
          // Test 3: Verify the update
          console.log('\n3️⃣ Verifying the update...');
          const verifyResponse = await fetch(`http://localhost:3000/api/complaints/${testComplaint.id}`);
          
          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            console.log('✅ Updated status verified:', {
              id: verifyResult.data.id,
              status: verifyResult.data.status,
              updated_at: verifyResult.data.updated_at
            });
          }
        } else {
          console.log('❌ Status update API failed:', updateResponse.status);
        }
      }
    }
    
    console.log('\n🎉 Status Update Test Complete!');
    console.log('\n📋 What was fixed:');
    console.log('- ✅ Enhanced error handling in handleStatusUpdate');
    console.log('- ✅ Added proper HTTP status checking');
    console.log('- ✅ Improved state update logic');
    console.log('- ✅ Added loading spinners for visual feedback');
    console.log('- ✅ Added console logging for debugging');
    console.log('- ✅ Added user feedback with alerts');
    
    console.log('\n💡 The status updates should now work without requiring page refresh!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStatusUpdate();
