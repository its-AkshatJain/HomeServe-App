import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import homserveLogo from '../assets/Homeserve-logo.webp';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
      <nav className="container mx-auto p-6 flex justify-between items-center rounded-md">
        <Link to="/" className="text-3xl font-extrabold hover:text-indigo-200 transition flex items-center">
          <img src={homserveLogo} alt="Service Image" className="w-10 h-10 rounded-full mr-3" />
          HomeServe
        </Link>
        <button className="lg:hidden text-2xl" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul
          className={`lg:flex space-x-6 text-lg ${isMenuOpen ? 'flex flex-col mt-4 space-y-4' : 'hidden lg:flex'} lg:mt-0 lg:space-y-0`}
        >
          <li>
            <Link to="/" className="hover:text-indigo-200 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-indigo-200 transition">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-indigo-200 transition">
              Services
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-indigo-200 transition">
              Contact
            </Link>
          </li>
        </ul>
        <div
          className={`flex space-x-4 ${isMenuOpen ? 'flex flex-col mt-4 space-y-4' : 'hidden lg:flex lg:space-y-0 lg:mt-0'}`}
        >
          {!isLoggedIn && !isAuthPage ? (
            <>
              <Link
                to="/register"
                className="bg-yellow-500 px-4 py-2 rounded-full hover:bg-yellow-600 transition text-white font-medium"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-gray-100 transition font-medium"
              >
                Login
              </Link>
            </>
          ) : (
            isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition text-white font-medium"
              >
                Logout
              </button>
            )
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
