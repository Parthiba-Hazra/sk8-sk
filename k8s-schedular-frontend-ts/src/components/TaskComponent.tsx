import React, { useState } from 'react';

const TaskComponent: React.FC = () => {
  const [message, setMessage] = useState('');

  const submitTask = async () => {
    try {
      console.log('Sending a task submission request to the backend...');

      const response = await fetch('http://localhost:8080/api/task/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Response from the backend:', data);

      setMessage(data.message); // Assuming the response contains a 'message' field
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const monitorTask = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/task/monitor');
      const data = await response.json();
      setMessage(data.message); // Assuming the response contains a 'message' field
    } catch (error) {
      console.error('Error monitoring task:', error);
    }
  };

  return (
    <div>
      <div className="header">sk8-sk the Kubernetes Task Scheduler</div>
      <div>
        <button onClick={submitTask}>Submit Task</button>
        <button onClick={monitorTask}>Monitor Task</button>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default TaskComponent;
