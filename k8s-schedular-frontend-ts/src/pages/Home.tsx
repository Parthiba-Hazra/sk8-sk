import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleConnect = () => {
    // Implement your logic to connect to the Kubernetes cluster
    console.log('Connecting to Kubernetes Cluster...');
  };

  // Define a variable for the background image path
  const backgroundImage = location.pathname === '/' ? 'kubernetes-logo.png' : '';

  return (
    <div className="container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="header">
        <h1>sk8-sk the Kubernetes Task Scheduler</h1>
      </div>
      <div className="buttons">
        <button className="button-64" onClick={handleLogin}>
          Login
        </button>
        <button className="button-64" onClick={handleRegister}>
          Register
        </button>
      </div>
      <div className="content">
        <button className="button-36 connect-button" onClick={handleConnect}>
          Connect to your Kubernetes Cluster
        </button>
      </div>
    </div>
  );
};

export default Home;
