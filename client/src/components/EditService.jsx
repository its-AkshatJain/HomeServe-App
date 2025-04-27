import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const EditService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState({
    service_name: '',
    description: '',
    price: 0,
    city: '',
    availability: 'offline',
  });
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/provider/service/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch service details');
        }

        const data = await response.json();
        setService(data.service);
        setCategoryId(data.service.category_id || '');
      } catch (error) {
        setMessage('Failed to fetch service details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/service-categories`);
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching service categories:', error);
      }
    };

    fetchServiceDetails();
    fetchCategories();
  }, [serviceId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const serviceData = {
      ...service,
      category_id: categoryId,
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/provider/edit-service/${serviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
  
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Service updated successfully!');
        setTimeout(() => { navigate('/service-provider-home') }, 2000);
      } else {
        setMessage('Error updating service: ' + (data.message || 'Unknown error.'));
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setMessage('An error occurred while updating the service.');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-700">Loading service details...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 flex flex-col justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 text-center mb-4">Edit Service</h2>
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
              value={service.service_name || ''}
              onChange={(e) => setService({ ...service, service_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter the service name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={service.description || ''}
              onChange={(e) => setService({ ...service, description: e.target.value })}
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
                value={service.price || ''}
                onChange={(e) => setService({ ...service, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter the price"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input
                type="text"
                value={service.city || ''}
                onChange={(e) => setService({ ...service, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter city"
                required
              />
            </div>
          </div>

          {/* Uncomment if using categories */}
          {/* <div className="mb-3">
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
          </div> */}

          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">Availability</label>
            <select
              value={service.availability}
              onChange={(e) => setService({ ...service, availability: e.target.value })}
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
          Update Service
        </button>
      </form>
    </div>
  );
};

export default EditService;
