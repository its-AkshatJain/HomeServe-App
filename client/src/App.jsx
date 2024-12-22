import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import ProvideService from './components/ProvideService';
import EditService from './components/EditService';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './components/NotFound';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import ServicePage from './components/ServicePage';
import Footer from './components/Footer';

const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/service-taker-home"
          element={
            <PrivateRoute>
              {/* <ServiceTakerHome /> */}
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/service-provider-home"
          element={
            <PrivateRoute>
              {/* <ServiceProviderHome /> */}
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-service"
          element={
            <PrivateRoute>
              <ProvideService />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-service/:serviceId"
          element={
            <PrivateRoute>
              <EditService />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
