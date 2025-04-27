import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

// Modal for displaying service details and booking
const ServiceDetailsModal = ({ service, onClose, onBook }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      alert('Please select a booking date.');
      return;
    }
    onBook(service.service_id, service.provider_id, selectedDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-4 text-indigo-700">{service.service_name}</h2>
        <p className="text-gray-600 mb-3"><strong>Description:</strong> {service.description}</p>
        <p className="text-gray-600 mb-3"><strong>Price:</strong> ₹{service.price}</p>
        <p className="text-gray-600 mb-3"><strong>Category:</strong> {service.category_name}</p>

        <div className="mt-4">
          <label className="block text-gray-700 mb-2" htmlFor="booking-date">
            Select Booking Date:
          </label>
          <input
            type="date"
            id="booking-date"
            className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <div className="mt-6">
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition ease-in-out duration-200 w-full"
            onClick={handleBookNow}
          >
            Book Service
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ServiceTakerHome = () => {
  const [services, setServices] = useState([]);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('User is not authenticated. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [servicesRes, currentBookingsRes, serviceHistoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/taker/services`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${API_BASE_URL}/api/taker/current-bookings`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${API_BASE_URL}/api/taker/service-history`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ]);

        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        if (!currentBookingsRes.ok) throw new Error('Failed to fetch current bookings');
        if (!serviceHistoryRes.ok) throw new Error('Failed to fetch service history');

        const servicesData = await servicesRes.json();
        const currentBookingsData = await currentBookingsRes.json();
        const serviceHistoryData = await serviceHistoryRes.json();

        setServices(servicesData.services || []);
        setCurrentBookings(currentBookingsData.bookings || []);
        setServiceHistory(serviceHistoryData.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleBookService = async (serviceId, providerId, requestedDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/taker/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          provider_id: providerId,
          requested_date: requestedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book service');
      }

      const data = await response.json();
      alert('Booking request sent successfully!');
      setSelectedService(null);
      setCurrentBookings((prev) => [...prev, data.booking]);
    } catch (err) {
      alert(err.message || 'Failed to book service. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/taker/cancel-booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      alert('Booking canceled successfully!');
      setCurrentBookings((prev) => prev.filter((booking) => booking.booking_id !== bookingId));
    } catch (err) {
      alert(err.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handleBookNowClick = (service) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-indigo-600">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-indigo-600">Service Taker Dashboard</h2>

        {/* Available Services */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Available Services</h3>
          {services.length === 0 ? (
            <p className="text-gray-500">No services available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.service_id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">{service.service_name}</h4>
                  <p className="mt-3 text-gray-600">{service.description}</p>
                  <p className="mt-3 text-sm text-gray-500">Price: ₹{service.price}</p>
                  <p className="mt-1 text-sm text-gray-500">Category: {service.category_name}</p>
                  <button
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 mt-4 w-full"
                    onClick={() => handleBookNowClick(service)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedService && (
          <ServiceDetailsModal
            service={selectedService}
            onClose={handleCloseModal}
            onBook={handleBookService}
          />
        )}

        {/* Current Bookings */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Current Bookings</h3>
          {currentBookings.length === 0 ? (
            <p className="text-gray-500">No current bookings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBookings.map((booking) => (
                <div key={booking.booking_id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">{booking.service_name}</h4>
                  <p className="mt-2 text-gray-600">Provider: {booking.provider_name}</p>
                  <p className="mt-2 text-sm text-gray-500">Status: {booking.status}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Booked on: {new Date(booking.booking_time).toLocaleString()}
                  </p>
                  {booking.status === 'pending' && (
                    <button
                      className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 mt-3"
                      onClick={() => handleCancelBooking(booking.booking_id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service History */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Service History</h3>
          {serviceHistory.length === 0 ? (
            <p className="text-gray-500">No service history available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceHistory.map((job) => (
                <div key={job.booking_id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">{job.service_name}</h4>
                  <p className="mt-2 text-gray-600">Provider: {job.provider_name}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Completed on: {new Date(job.completion_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceTakerHome;
