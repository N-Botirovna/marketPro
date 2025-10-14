// Test component to verify PATCH request to v1/auth/me/update
import React, { useState } from 'react';
import { updateUserProfile } from '@/services/auth';

const ProfileUpdateTest = () => {
  const [testData, setTestData] = useState({
    first_name: 'Test',
    last_name: 'User',
    bio: 'Test bio update'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestUpdate = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('🧪 Testing PATCH request to v1/auth/me/update');
      console.log('📤 Test data:', testData);
      
      const response = await updateUserProfile(testData);
      
      setResult({
        success: true,
        data: response
      });
      
      console.log('✅ Test completed successfully:', response);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data
      });
      
      console.error('❌ Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-32">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Profile Update Test</h3>
              <p className="text-muted">Test PATCH request to v1/auth/me/update</p>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={testData.first_name}
                  onChange={(e) => setTestData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={testData.last_name}
                  onChange={(e) => setTestData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={testData.bio}
                  onChange={(e) => setTestData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleTestUpdate}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test PATCH Request'}
              </button>
              
              {result && (
                <div className={`mt-3 p-3 rounded ${result.success ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                  <h5>{result.success ? 'Success!' : 'Error!'}</h5>
                  <pre className="mb-0" style={{ fontSize: '12px' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateTest;
