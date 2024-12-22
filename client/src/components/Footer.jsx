import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-indigo-700 text-white py-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">About Us</h3>
            <p className="text-sm leading-relaxed text-gray-200">
              HomeServe is your trusted partner in finding and offering services effortlessly. 
              We connect professionals with people who need them, ensuring convenience and reliability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/services"
                  className="text-gray-300 hover:text-yellow-300 transition duration-200"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-yellow-300 transition duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-yellow-300 transition duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-300 hover:text-yellow-300 transition duration-200"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
            <ul className="text-gray-300 space-y-3 text-sm">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:contact@homeserve.com"
                  className="hover:text-yellow-300 transition duration-200"
                >
                  contact@homeserve.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{' '}
                <a
                  href="tel:+919876543210"
                  className="hover:text-yellow-300 transition duration-200"
                >
                  +91-8319738731
                </a>
              </li>
              <li>
                <strong>Address:</strong> 123 HomeServe Street, Service City, SC 12345
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-indigo-500 pt-4 text-center">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} HomeServe. All rights reserved.
          </p>
          <p className="mt-2">
            Follow us on{' '}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300 transition duration-200 underline"
            >
              Twitter
            </a>
            ,{' '}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300 transition duration-200 underline"
            >
              Facebook
            </a>
            , and{' '}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300 transition duration-200 underline"
            >
              Instagram
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
