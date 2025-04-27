import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceTakerHome from './ServiceTakerHome';
import ServiceProviderHome from './ServiceProviderHome';
import API_BASE_URL from '../config';

const Home = () => {
  const [role, setRole] = useState(localStorage.getItem('role') || 'taker');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/login'); // Redirect if not logged in
    }
  }, [navigate]);

  const handleSwitchRole = async () => {
    const newRole = role === 'taker' ? 'provider' : 'taker';
    setRole(newRole);
    localStorage.setItem('role', newRole);

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole }), // Only the role; userId comes from the token
      });

      const data = await response.json();
      if (!data.success) {
        alert('Failed to update role in the database.');
      }
    } catch (error) {
      console.error('Error switching role:', error);
      alert('Error switching role.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex flex-col items-center py-12">
      {/* Welcome Box */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg rounded-lg max-w-7xl w-full mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold">
            {role === 'taker' ? 'Welcome, Service Taker' : 'Welcome, Service Provider'}
          </h2>
          <button
            className="bg-white text-indigo-600 py-2 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out"
            onClick={handleSwitchRole}
          >
            Switch to {role === 'taker' ? 'Provider' : 'Taker'} Role
          </button>
        </div>
      </div>

      {/* Main content area */}
      {/* className="bg-white shadow-md rounded-lg max-w-7xl w-full p-8" */}
      <div>
        {role === 'taker' ? (
          <ServiceTakerHome />
        ) : (
          <ServiceProviderHome />
        )}
      </div>
    </div>
  );
};

export default Home;
