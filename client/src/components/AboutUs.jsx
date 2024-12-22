import React from 'react';
import AboutImage from '../assets/About-Image.webp'
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/login'); // Replace '/login' with your actual login route if different
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-indigo-600 text-center mb-6">About HomeServe</h1>
          <p className="text-lg text-gray-700 mb-4 text-center">
            Welcome to <span className="font-semibold text-indigo-600">HomeServe</span> — your trusted companion for connecting service providers with clients for a seamless home-service experience.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center items-center">
              <img
                src={AboutImage}
                alt="Service Image"
                className="rounded-lg shadow-md w-full max-w-md h-auto object-cover"
              />
            </div>
            <div className="flex flex-col justify-center items-center md:items-start">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4 text-center md:text-left">
                At <span className="font-semibold text-indigo-600">HomeServe</span>, we strive to bridge the gap between service providers and clients, ensuring a reliable and efficient solution for everyday needs. Our platform is designed to make finding and booking home services simple, safe, and efficient.
              </p>
              <p className="text-gray-700 text-center md:text-left">
                Whether you need a plumber, an electrician, a cleaning service, or other specialized professionals, <span className="font-semibold text-indigo-600">HomeServe</span> offers a user-friendly experience that saves you time and effort.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Why Choose HomeServe?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Trusted Providers</h3>
                <p className="text-gray-700">
                  We ensure all service providers are verified and maintain high standards of quality and professionalism.
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Easy Booking</h3>
                <p className="text-gray-700">
                  Our seamless booking system allows users to schedule appointments in just a few clicks.
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Transparent Pricing</h3>
                <p className="text-gray-700">
                  Know the cost upfront with no hidden fees, ensuring you get the best value for your services.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Core Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Comprehensive Listings:</strong> Browse a wide variety of home services tailored to your needs.</li>
              <li><strong>User Reviews and Ratings:</strong> Make informed choices by reading reviews and feedback from other clients.</li>
              <li><strong>Secure Transactions:</strong> Your payments are protected through our secure gateway, ensuring a hassle-free experience.</li>
              <li><strong>Customer Support:</strong> Our support team is always ready to assist you with any questions or concerns.</li>
            </ul>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Us Today</h2>
            <p className="text-gray-700 mb-4">
              Experience the convenience and reliability that <span className="font-semibold text-indigo-600">HomeServe</span> brings to your home-service needs. Sign up today and take the first step towards effortless service solutions.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700" onClick={handleGetStartedClick} >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
