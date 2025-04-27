import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const app = express();
const port = 3000;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
// Cross-Origin Resource Sharing
app.use(cors()); 
// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware for role checking
const checkProvider = async (req, res, next) => {
  const userId = req.user.id;
  const userResult = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
  
  if (userResult.rows.length === 0 || userResult.rows[0].role !== 'provider') {
    return res.status(403).json({ message: 'Access denied. Providers only.' });
  }
  next();
};

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify the token and extract the user information
  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach the user information (id) to the request object
    req.user = user; // `user.id` will be available
    next();
  });
};


// Initialize PostgreSQL client using pg.Pool for connection pooling
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the database connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database.');
  }
});

// Route for user registration
app.post('/api/register', async (req, res) => {
  const { email, password, name, phone, address, city } = req.body;

  try {
    // Hash password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone_number, address, city) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [email, hashedPassword, name, phone, address, city]
    );

    // Respond with success and user information
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).json({ success: false, message: 'Error registering user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Create a token with the user's ID
    const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

    // Send token back to the client
    res.json({ success: true, message: 'Login successful', token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ success: false, message: 'Error logging in user' });
  }
});

// Select Role
app.post('/api/select-role', authenticateToken, async (req, res) => {
  const { role } = req.body; // Role is still passed from the request body

  console.log('Decoded user:', req.user); // Debug: Ensure user is attached
  console.log('Requested role:', role);   // Debug: Ensure role is passed

  try {
    // Use req.user.id from the decoded JWT token
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *',
      [role, req.user.id] // Use the user ID from the JWT token
    );
    console.log('SQL Query:', 'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *', [role, req.user.id]);


    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Respond with success
    res.json({ success: true, message: 'Role updated successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error selecting role:', err);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// ---------------------------------------------------------------------------------------------------------------
//                                             Provider
// ---------------------------------------------------------------------------------------------------------------
// Service categories for dropdown
app.get('/api/service-categories', async (req, res) => {
  try {
    // Fetch all categories from the Service_Categories table
    const result = await pool.query('SELECT * FROM Service_Categories ORDER BY category_name');
    
    // Respond with the categories
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ message: 'Error fetching service categories' });
  }
});

// Adding Service
app.post('/api/add-service', authenticateToken, checkProvider, async (req, res) => {
  const { service_name, description, price, category_id, city, availability } = req.body;
  const userId = req.user.id;

  if (!service_name || !description || !price || !category_id || !city || !availability) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    let providerResult = await pool.query(
      'SELECT provider_id FROM Service_Providers WHERE user_id = $1',
      [userId]
    );

    let providerId;
    if (providerResult.rows.length === 0) {
      const newProviderResult = await pool.query(
        'INSERT INTO Service_Providers (user_id, city, availability) VALUES ($1, $2, $3) RETURNING provider_id',
        [userId, city, availability]
      );
      providerId = newProviderResult.rows[0].provider_id;
    } else {
      providerId = providerResult.rows[0].provider_id;
      await pool.query(
        'UPDATE Service_Providers SET city = $1, availability = $2 WHERE provider_id = $3',
        [city, availability, providerId]
      );
    }

    let serviceResult = await pool.query(
      'SELECT service_id FROM Services WHERE service_name = $1 AND category_id = $2',
      [service_name, category_id]
    );

    let serviceId;
    if (serviceResult.rows.length === 0) {
      const newServiceResult = await pool.query(
        'INSERT INTO Services (service_name, description, price, category_id) VALUES ($1, $2, $3, $4) RETURNING service_id',
        [service_name, description, price, category_id]
      );
      serviceId = newServiceResult.rows[0].service_id;
    } else {
      serviceId = serviceResult.rows[0].service_id;
    }

    await pool.query(
      'INSERT INTO Service_Provider_Services (provider_id, service_id) VALUES ($1, $2)',
      [providerId, serviceId]
    );

    res.json({ success: true, message: 'Service added successfully!' });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Error adding service' });
  }
});

// Fetch services for the provider
app.get('/api/provider/services', authenticateToken, async (req, res) => {
  try {
    const providerId = req.user.id;  // Assuming the authentication middleware sets req.user with user ID

    const queryText = `
      SELECT 
        sps.provider_service_id,
        s.service_name,
        s.description,
        s.price,
        sc.category_name,
        sp.city,                 -- Include city
        sp.rating,
        sp.total_jobs_completed,
        sp.availability
      FROM 
        Service_Provider_Services sps
      JOIN 
        Service_Providers sp ON sps.provider_id = sp.provider_id
      JOIN 
        Services s ON sps.service_id = s.service_id
      JOIN 
        Service_Categories sc ON s.category_id = sc.category_id
      WHERE 
        sp.user_id = $1  
    `;

    const { rows: services } = await pool.query(queryText, [providerId]);

    if (services.length === 0) {
      // Instead of 404, return 200 with an empty array and a helpful message
      return res.status(200).json({
        success: true,
        services: [],
        message: 'No services found. Please add your first service.',
      });
    }

    if (services.length === 0) {
      return res.status(404).json({ success: false, message: 'No services found for this provider' });
    }

    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update/Edit an existing service
app.get('/api/provider/service/:serviceId', authenticateToken, async (req, res) => {
  const providerServiceId = req.params.serviceId;

  console.log('Received ProviderService ID:', providerServiceId);

  try {
    // Query to get `service_id` and `provider_id` from `Service_Provider_Services`
    const serviceIdResult = await pool.query(
      'SELECT service_id, provider_id FROM Service_Provider_Services WHERE provider_service_id = $1',
      [providerServiceId]
    );

    // If no provider found, return an error
    if (serviceIdResult.rowCount === 0) {
      console.log('Provider not found for this user');
      return res.status(404).json({ success: false, message: 'Provider not found for this user' });
    }

    const { service_id, provider_id } = serviceIdResult.rows[0];
    console.log('Service ID fetched:', service_id);

    // Fetch service details from `Services` table and related provider details from `Service_Providers` table
    const serviceResult = await pool.query(
      `SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.price,
        sp.city,
        sp.availability
      FROM 
        Services s
      JOIN 
        Service_Providers sp ON sp.provider_id = $1
      WHERE 
        s.service_id = $2`,
      [provider_id, service_id]
    );

    if (serviceResult.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const service = serviceResult.rows[0];

    res.json({ service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/provider/edit-service/:serviceId', authenticateToken, async (req, res) => {
  const providerServiceId = req.params.serviceId;
  const { service_name, description, price, city, availability } = req.body;

  try {
    // Ensure that `category_id` is not included in the update query
    const serviceIdResult = await pool.query(
      'SELECT service_id, provider_id FROM Service_Provider_Services WHERE provider_service_id = $1',
      [providerServiceId]
    );

    if (serviceIdResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found for this service' });
    }

    const { service_id, provider_id } = serviceIdResult.rows[0];

    // Update the `Services` table without changing `category_id`
    const serviceUpdateResult = await pool.query(
      'UPDATE Services SET service_name = $1, description = $2, price = $3, updated_at = CURRENT_TIMESTAMP WHERE service_id = $4 RETURNING *',
      [service_name, description, price, service_id]
    );

    if (serviceUpdateResult.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found or not authorized' });
    }

    // Update the `Service_Providers` table for `city` and `availability`
    const providerUpdateResult = await pool.query(
      'UPDATE Service_Providers SET city = $1, availability = $2 WHERE provider_id = $3 RETURNING city, availability',
      [city, availability, provider_id]
    );

    res.json({
      success: true,
      message: 'Service and provider details updated successfully',
      service: serviceUpdateResult.rows[0],
      providerDetails: providerUpdateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete a service
app.delete('/api/provider/delete-service/:serviceId', authenticateToken, async (req, res) => {
  const serviceId = req.params.serviceId;
  const userId = req.user.id; // Assuming the token provides the user ID
  
  console.log('Received Service ID:', serviceId);
  console.log('User ID from token:', userId);

  try {
    // Query to get providerId from Service_Providers using userId
    const providerResult = await pool.query(
      'SELECT provider_id FROM Service_Providers WHERE user_id = $1',
      [userId]
    );

    // If no provider found, return an error
    if (providerResult.rowCount === 0) {
      console.log('Provider not found for this user');
      return res.status(404).json({ success: false, message: 'Provider not found for this user' });
    }

    const providerId = providerResult.rows[0].provider_id;
    console.log('Provider ID fetched:', providerId);

    // Perform the deletion of the service
    const deleteResult = await pool.query(
      'DELETE FROM Service_Provider_Services WHERE provider_service_id = $1 AND provider_id = $2 RETURNING *',
      [serviceId, providerId]
    );

    if (deleteResult.rowCount === 0) {
      console.log('Service not found or unauthorized');
      return res.status(404).json({ success: false, message: 'Service not found or not authorized' });
    }

    console.log('Service deleted successfully:', deleteResult.rows[0]);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Route to fetch current (active but not completed) jobs for a provider
app.get('/api/provider/current-jobs', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Assuming token contains userId
  try {
    // Get provider_id for the authenticated user
    const providerResult = await pool.query(
      'SELECT provider_id FROM Service_Providers WHERE user_id = $1',
      [userId]
    );

    if (providerResult.rowCount === 0) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    const providerId = providerResult.rows[0].provider_id;

    // Fetch jobs booked with this provider that are not yet completed
    const result = await pool.query(`
      SELECT 
        b.booking_id,
        b.user_id,
        u.name AS user_name,
        u.address AS user_address,
        b.service_id,
        s.service_name,
        b.status,
        b.requested_date,
        b.booking_time
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Services s ON b.service_id = s.service_id
      WHERE b.provider_id = $1 
        AND b.status IN ('pending', 'confirmed')
      ORDER BY b.requested_date ASC;
    `, [providerId]);

    res.status(200).json({ 
      success: true, 
      jobs: result.rows 
    });
  } catch (error) {
    console.error('Error fetching current jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current jobs' 
    });
  }
});


// PUT /api/provider/update-job-status/:jobId
app.put('/api/provider/update-job-status/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params; // Extract the bookingId from the URL parameter
  const { status } = req.body;      // Extract the status from the request body

  console.log('Received Booking ID:', bookingId); // Log the bookingId for debugging
  console.log('Received Status:', status);        // Log the status for debugging

  const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  // Validation for missing bookingId
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }

  // Validation for invalid status
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    // Query to update the booking's status using booking_id in the Bookings table
    const result = await pool.query(
      'UPDATE Bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2 RETURNING *',
      [status, bookingId] // Pass the status and bookingId to the query
    );

    // If no booking is found with the given bookingId
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If the booking is found and updated, return a success response
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: result.rows[0] // Send back the updated booking information
    });
  } catch (err) {
    // If there is an error, return an error response
    console.error('Error updating booking status:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
});

// In your backend route to get completed jobs
app.get('/api/provider/completed-jobs', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Assuming token contains userId
  try {
    // Get provider_id for the authenticated user
    const providerResult = await pool.query(
      'SELECT provider_id FROM Service_Providers WHERE user_id = $1',
      [userId]
    );

    if (providerResult.rowCount === 0) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    const providerId = providerResult.rows[0].provider_id;

    // Fetch jobs booked with this provider that are completed
    const result = await pool.query(`
      SELECT 
        b.booking_id,
        b.user_id,
        u.name AS user_name,
        u.address AS user_address,
        b.service_id,
        s.service_name,
        b.status,
        b.updated_at AS completed_date
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Services s ON b.service_id = s.service_id
      WHERE b.provider_id = $1 
        AND b.status = 'completed'
      ORDER BY b.updated_at DESC;
    `, [providerId]);

    res.status(200).json({ 
      success: true, 
      jobs: result.rows 
    });
  } catch (error) {
    console.error('Error fetching completed jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch completed jobs' 
    });
  }
});


// -----------------------------------------------------------------------------------------------------------------
//                                                        Taker
// -----------------------------------------------------------------------------------------------------------------
// Fetch all services available for service takers
app.get('/api/taker/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id, 
        s.service_name, 
        s.description, 
        s.price, 
        sc.category_name, 
        COALESCE(sp.rating, 0) AS provider_rating,
        sp.availability,
        sp.city
      FROM Services s
      JOIN Service_Categories sc ON s.category_id = sc.category_id
      JOIN Service_Provider_Services sps ON s.service_id = sps.service_id
      JOIN Service_Providers sp ON sps.provider_id = sp.provider_id
      ORDER BY s.service_name;
    `);
    res.status(200).json({ services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// View details of a specific service by service ID
app.get('/api/taker/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id, 
        s.service_name, 
        s.description, 
        s.price, 
        sc.category_name, 
        sp.provider_id,
        sp.city,
        sp.availability,
        COALESCE(sp.rating, 0) AS provider_rating
      FROM Services s
      JOIN Service_Categories sc ON s.category_id = sc.category_id
      JOIN Service_Provider_Services sps ON s.service_id = sps.service_id
      JOIN Service_Providers sp ON sps.provider_id = sp.provider_id
      WHERE s.service_id = $1;
    `, [serviceId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ service: result.rows[0] });
  } catch (error) {
    console.error('Error fetching service details:', error);
    res.status(500).json({ message: 'Failed to fetch service details' });
  }
});

// Route to book a service
app.post('/api/taker/bookings', authenticateToken, async (req, res) => {
  const { service_id, requested_date } = req.body;

  if (!service_id || !requested_date) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: service_id or requested_date' });
  }

  try {
    // Fetch provider_id based on service_id
    const providerResult = await pool.query(
      `SELECT provider_id FROM Service_Provider_Services WHERE service_id = $1`,
      [service_id]
    );

    if (providerResult.rowCount === 0) {
      return res.status(404).json({ error: 'No provider found for this service' });
    }

    const provider_id = providerResult.rows[0].provider_id;
    const user_id = req.user.id; 

    // Insert booking into the database with `booking_time` set to current time
    const result = await pool.query(
      `INSERT INTO Bookings 
       (booking_id, user_id, service_id, provider_id, requested_date, booking_time, status, payment_status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), 'pending', 'unpaid', NOW(), NOW())
       RETURNING *`,
      [user_id, service_id, provider_id, requested_date]
    );

    res.status(201).json({ message: 'Booking created successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error.code === '23505') { // Unique violation (e.g., duplicate booking)
      return res.status(409).json({ error: 'Booking already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to view current bookings for a service taker
app.get('/api/taker/current-bookings', authenticateToken, async (req, res) => {
  const user_id = req.user.id; // Extracted from the token
  console.log(req.user);
  try {
    // Fetch current bookings
    const result = await pool.query(`
      SELECT 
        b.booking_id,
        b.service_id,
        s.service_name,
        sp.provider_id,
        u.name AS provider_name,
        b.requested_date,
        b.booking_time,
        b.status,
        b.payment_status,
        b.created_at,
        b.updated_at
      FROM Bookings b
      JOIN Services s ON b.service_id = s.service_id
      JOIN Service_Providers sp ON b.provider_id = sp.provider_id
      JOIN Users u ON sp.user_id = u.user_id
      WHERE b.user_id = $1 AND b.status IN ('pending', 'confirmed')
      ORDER BY b.requested_date ASC, b.booking_time DESC;
    `, [user_id]);

    if (result.rowCount === 0) {
      return res.status(200).json({ success: true, bookings: [], message: 'No current bookings found' });
    }

    res.status(200).json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Error fetching current bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to cancel a booking
app.delete('/api/taker/cancel-booking/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  const user_id = req.user.id; // Extracted from the token

  try {
    const result = await pool.query(`
      DELETE FROM Bookings 
      WHERE booking_id = $1 AND user_id = $2 AND status = 'pending'
      RETURNING *;
    `, [bookingId, user_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or cannot be canceled' });
    }

    res.status(200).json({ success: true, message: 'Booking canceled successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

app.get('/api/taker/service-history', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Assuming you have user authentication middleware
  // console.log(req.user);
  try {
    const result = await pool.query(
      `
      SELECT 
          b.booking_id,
          s.service_name,
          u.name AS provider_name,
          b.requested_date,
          b.booking_time,
          b.updated_at AS completion_time
      FROM 
          Bookings b
      INNER JOIN 
          Services s ON b.service_id = s.service_id
      INNER JOIN 
          Service_Providers sp ON b.provider_id = sp.provider_id
      INNER JOIN 
          Users u ON sp.user_id = u.user_id
      WHERE 
          b.user_id = $1 AND b.status = 'completed'
      ORDER BY 
          b.updated_at DESC;
      `,
      [userId]
    );

    res.status(200).json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching service history:', error.message);
    res.status(500).json({ error: 'Failed to fetch service history.' });
  }
});

// Contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Insert data into the contact_messages table
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );

    res.status(201).json({
      success: true,
      message: 'Message saved successfully!',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Services Page
// Route to get all services with their providers
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.price,
        s.category_id,
        sc.category_name,
        sp.provider_id,
        sp.availability,
        sp.city,
        u.name AS provider_name,
        sp.rating,
        sp.total_jobs_completed
      FROM Services s
      JOIN Service_Provider_Services sps ON s.service_id = sps.service_id
      JOIN Service_Providers sp ON sps.provider_id = sp.provider_id
      JOIN Users u ON sp.user_id = u.user_id
      JOIN Service_Categories sc ON s.category_id = sc.category_id;
    `);
    res.status(200).json({ services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
