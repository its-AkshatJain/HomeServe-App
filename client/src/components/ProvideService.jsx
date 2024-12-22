import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProvideService = () => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [availability, setAvailability] = useState('available');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/service-categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching service categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      setMessage('User not logged in.');
      return;
    }

    const serviceData = {
      service_name: serviceName,
      description,
      price,
      category_id: categoryId,
      city,
      availability,
    };

    try {
      const response = await fetch('http://localhost:3000/api/add-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();
      console.log('Response from backend:', data);

      if (data.success) {
        setMessage('Service added successfully!');
        setServiceName('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setCity('');
        setAvailability('available');

        setTimeout(() => {
          navigate('/service-provider-home');
        }, 2000);
      } else {
        setMessage('Error adding service: ' + (data.message || 'Unknown error.'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('An error occurred while adding the service.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 flex flex-col justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 text-center mb-4">Add a New Service</h2>
          {message && (
            <p
              className={`text-center ${
                message.includes('successfully') ? 'text-green-600' : 'text-red-500'
              } mb-4`}
            >
              {message}
            </p>
          )}

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter the service name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Provide a detailed description"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter the price"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter city"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Service Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Add Service
        </button>
      </form>
    </div>
  );
};

export default ProvideService;
