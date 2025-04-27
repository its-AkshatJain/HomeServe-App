import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [roleSelection, setRoleSelection] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('token', data.token);
      setRoleSelection(true);
    } else {
      alert(data.message || 'Login failed');
    }
  };

  // Handle role selection
  const handleRoleSelection = async (role) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      alert('User ID or token not found. Please login again.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('role', role);

        // Redirect based on role
        if (role === 'taker') {
          navigate('/service-taker-home'); // Redirect to Service Taker Home
        } else if (role === 'provider') {
          navigate('/service-provider-home'); // Redirect to Service Provider Home
        }
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      alert('Error selecting role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      {!roleSelection ? (
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
          {/* Email and password fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200">
            Log In
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800">Register</Link>
            </p>
          </div>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Role</h2>
          <div className="flex flex-col space-y-4">
            <button
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
              onClick={() => handleRoleSelection('taker')}
            >
              Take a Service
            </button>
            <button
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition duration-200"
              onClick={() => handleRoleSelection('provider')}
            >
              Provide a Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
