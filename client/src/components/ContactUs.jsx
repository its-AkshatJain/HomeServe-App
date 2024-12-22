import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-indigo-600 text-center mb-6">Contact Us</h1>
          <p className="text-lg text-gray-700 mb-8 text-center">
            We'd love to hear from you! Whether you have questions, feedback, or just want to reach out, feel free to drop us a message.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Get in Touch</h2>
              <p className="text-gray-700 mb-4">
                <strong>Email:</strong> contact@homeserve.com
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Phone:</strong> +91-8319738731
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Address:</strong> 123 HomeServe Street, Service City, SC 12345
              </p>
              <p className="text-gray-700">
                <strong>Office Hours:</strong> Mon-Fri: 9:00 AM - 6:00 PM
              </p>
              {/* Placeholder for a map or a graphic */}
              <div className="mt-6">
                <iframe
                  title="Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.135406756316!2d78.20442737487147!3d26.224789489315945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c1523ca9a87f%3A0xb3eb12450b679a28!2s53%2C%20Indramani%20Nagar%20Rd%2C%20Indramani%20Nagar%2C%20Thatipur%2C%20Gwalior%2C%20Madhya%20Pradesh%20474011!5e0!3m2!1sen!2sin!4v1731842644921!5m2!1sen!2sin"
                  className="w-full h-48 rounded-lg shadow-md"
                  frameBorder="0"
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700 w-full"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
