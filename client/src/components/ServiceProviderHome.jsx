import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceProviderHome = () => {
  const [services, setServices] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, currentJobsRes, completedJobsRes] = await Promise.all([
          fetch('http://localhost:3000/api/provider/services', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch('http://localhost:3000/api/provider/current-jobs', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch('http://localhost:3000/api/provider/completed-jobs', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ]);

        if (servicesRes.status === 404) {
          setServices([]);
        } else if (!servicesRes.ok) {
          throw new Error(`Services endpoint failed: ${servicesRes.status}`);
        }

        if (currentJobsRes.status === 404) {
          setCurrentJobs([]);
        } else if (!currentJobsRes.ok) {
          throw new Error(`Current jobs endpoint failed: ${currentJobsRes.status}`);
        }

        if (completedJobsRes.status === 404) {
          setCompletedJobs([]);
        } else if (!completedJobsRes.ok) {
          throw new Error(`Completed jobs endpoint failed: ${completedJobsRes.status}`);
        }

        const [servicesData, currentJobsData, completedJobsData] = await Promise.all([
          servicesRes.json(),
          currentJobsRes.json(),
          completedJobsRes.json(),
        ]);

        setServices(servicesData.services || []);
        setCurrentJobs(currentJobsData.jobs || []);
        setCompletedJobs(completedJobsData.jobs || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
    else setError('User is not authenticated. Please log in.');
  }, [token]);

  const handleAddService = () => navigate('/add-service');

  const handleEditService = (serviceId) => navigate(`/edit-service/${serviceId}`);

  const handleDeleteService = async (serviceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/provider/delete-service/${serviceId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete service');
      const data = await response.json();

      if (data.success) {
        setServices((prevServices) =>
          prevServices.filter((service) => service.provider_service_id !== serviceId)
        );
      } else {
        alert('Failed to delete the service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('An error occurred while deleting the service.');
    }
  };

  const handleUpdateJobStatus = async (bookingId, newStatus) => {
    if (!bookingId) {
      alert('Invalid Booking ID');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/provider/update-job-status/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.booking_id === bookingId ? { ...job, status: newStatus } : job
          )
        );

        if (newStatus === 'completed' && data.job) {
          setCompletedJobs((prevJobs) => [
            ...prevJobs,
            {
              booking_id: data.job.booking_id || Math.random(),
              service_name: data.job.service_name || 'Unknown Service',
              status: data.job.status || 'completed',
              completed_date: data.job.completed_date || new Date().toISOString().split('T')[0],
            },
          ]);

          setCurrentJobs((prevJobs) =>
            prevJobs.filter((job) => job.booking_id !== bookingId)
          );
        }

        alert('Job status updated successfully');
      } else {
        alert(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('An error occurred while updating the job status.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl font-semibold">{error}</div>;
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-indigo-600">Service Provider Dashboard</h2>

        {/* Manage Services */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Manage Services</h3>
          <button
            className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 mb-6 shadow-md"
            onClick={handleAddService}
          >
            + Add New Service
          </button>
          {services.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-lg">You haven't added any services yet. Start by adding your first service.</p>
              <button
                className="mt-4 bg-indigo-500 text-white py-2 px-6 rounded-md hover:bg-indigo-600 shadow-md"
                onClick={handleAddService}
              >
                Add a Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.provider_service_id}
                  className="flex flex-col bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 min-h-[300px] border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="text-2xl font-semibold mb-2 text-indigo-700">{service.service_name}</h4>
                    <p className="text-gray-600 mb-2">{service.description}</p>
                    <p className="text-sm text-gray-500 mb-1">Price: ₹{service.price}</p>
                    <p className="text-sm text-gray-500 mb-1">City: {service.city || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Availability: {service.availability ? 'Available' : 'Not Available'}</p>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      className="bg-yellow-500 text-white py-1 px-4 rounded-md hover:bg-yellow-600 shadow-md"
                      onClick={() => handleEditService(service.provider_service_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600 shadow-md"
                      onClick={() => handleDeleteService(service.provider_service_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Jobs */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Current Jobs</h3>
          {currentJobs.length === 0 ? (
            <p className="text-gray-500 text-lg">You have no current jobs at the moment. Check back later for new bookings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJobs.map((job) => (
                <div
                  key={job.booking_id}
                  className="flex flex-col bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 min-h-[300px] border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="text-2xl font-semibold mb-2 text-indigo-700">Job #{job.booking_id}</h4>
                    <p className="text-gray-600 mb-2">Service: {job.service_name}</p>
                    <p className="text-gray-600 mb-2">User: {job.user_name}</p>
                    <p className="text-gray-600 mb-2">Address: {job.user_address}</p>
                    <p className="text-sm text-gray-500 mb-4">Status: {job.status}</p>
                  </div>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    value={job.status}
                    onChange={(e) => handleUpdateJobStatus(job.booking_id, e.target.value)}
                  >
                    <option value="">Change Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Jobs */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Completed Jobs</h3>
          {completedJobs.length === 0 ? (
            <p className="text-gray-500 text-lg">No jobs have been completed yet. Work hard to get some bookings!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedJobs.map((job) => (
                <div
                  key={job.booking_id}
                  className="flex flex-col bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 min-h-[300px] border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="text-2xl font-semibold mb-2 text-indigo-700">Job #{job.booking_id}</h4>
                    <p className="text-gray-600 mb-2">Service: {job.service_name}</p>
                    <p className="text-gray-600 mb-2">User: {job.user_name}</p>
                    <p className="text-gray-600 mb-2">Address: {job.user_address}</p>
                    <p className="text-sm text-gray-500 mb-1">Status: {job.status}</p>
                    <p className="text-sm text-gray-500">Completed on: {job.completed_date || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderHome;
