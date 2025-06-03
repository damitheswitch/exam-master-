import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1e293b', 
      color: 'white', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>🎉 React App is Working!</h1>
      <p>If you can see this, the basic setup is fine.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestPage; 