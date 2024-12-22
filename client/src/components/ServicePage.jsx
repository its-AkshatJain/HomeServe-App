import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaDollarSign, FaUser } from 'react-icons/fa';

const ServicePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/services')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        } else {
          console.warn('No services received from the backend.');
          setServices([]);
        }
      })
      .catch(error => {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-600">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-10 p-6 bg-indigo-100 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-indigo-800">Discover Our Top Services</h1>
        <p className="text-gray-600 mt-2">Find the perfect service that fits your needs. No login required!</p>
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-600">Available Services</h2>
        {services.length === 0 ? (
          <p className="text-center text-gray-500">No services available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.service_id}
                className="p-5 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-semibold text-indigo-700 mb-2">{service.service_name}</h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaDollarSign className="mr-2 text-indigo-500" />
                  <span>Price: ₹{service.price}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                  <span>Location: {service.city}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaUser className="mr-2 text-indigo-500" />
                  <span>Provider: {service.provider_name}</span>
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    service.availability === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Status: {service.availability}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePage;
