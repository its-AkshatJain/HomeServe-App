import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from 'jsonwebtoken';

// JWT Secret key for signing tokens (use a strong secret in production)
// const JWT_SECRET = 'JWT_SECRET'; 

const app = express();
const port = 3000;

// Cross-Origin Resource Sharing
app.use(cors()); 
// Middleware to parse JSON request bodies
app.use(express.json());

// // Middleware to authenticate the user based on the JWT token
// const authenticateUser = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Assuming token is passed as "Bearer <token>"

//   if (!token) {
//     return res.status(401).json({ message: 'Authentication token is missing' });
//   }

//   // Verify the token and extract user details
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }

//     // Attach the user data to the request object
//     req.user = user;
//     next();
//   });
// };

// Middleware for role checking
const checkProvider = async (req, res, next) => {
  const userId = req.user.id;
  const userResult = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
  
  if (userResult.rows.length === 0 || userResult.rows[0].role !== 'provider') {
    return res.status(403).json({ message: 'Access denied. Providers only.' });
  }
  next();
};

// Initialize PostgreSQL client using pg.Pool for connection pooling
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "Homeserve",
  password: "akshat1234",
  port: 5432,
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

// Route for user login with role selection
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch the user from the database using the email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // If the login is successful, respond with a success message
    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ success: false, message: 'Error logging in user' });
  }
});
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Fetch the user from the database using the email
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

//     if (result.rows.length === 0) {
//       return res.status(400).json({ success: false, message: 'User not found' });
//     }

//     const user = result.rows[0];

//     // Compare the provided password with the hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password_hash);

//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Invalid password' });
//     }

//     // Generate a JWT token (valid for 1 hour or adjust as needed)
//     const token = jwt.sign(
//       { id: user.user_id, role: user.role }, // payload
//       JWT_SECRET, // secret key
//       { expiresIn: '1h' } // token expiration
//     );

//     // Respond with the JWT token and success message
//     res.json({ success: true, message: 'Login successful', token });
//   } catch (err) {
//     console.error('Error logging in user:', err);
//     res.status(500).json({ success: false, message: 'Error logging in user' });
//   }
// });

// Endpoint to select role after login
// Route for role selection
app.post('/api/select-role', async (req, res) => {
  const { userId, role } = req.body;

  // Validate inputs
  if (!userId || !role) {
    return res.status(400).json({ success: false, message: 'User ID and role are required' });
  }

  try {
    // Update user role in database
    const result = await pool.query('UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *', [role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error selecting role:', err);
    return res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});
// app.post('/api/select-role', async (req, res) => {
//   const { userId, role } = req.body;

//   try {
//     // Ensure you are using the correct column name for the user ID
//     const result = await pool.query(
//       'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *',
//       [role, userId] // Make sure 'user_id' is the correct column name
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Respond with success
//     res.json({ success: true, message: 'Role updated successfully', user: result.rows[0] });
//   } catch (err) {
//     console.error('Error selecting role:', err);
//     res.status(500).json({ success: false, message: 'Failed to update role' });
//   }
// });



// app.post('/api/select-role', authenticateUser, async (req, res) => {
//   const { role } = req.body;
//   const userId = req.user.id; // userId now comes from authenticated user

//   try {
//     const result = await pool.query(
//       'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *',
//       [role, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     res.json({ success: true, message: 'Role updated successfully', user: result.rows[0] });
//   } catch (err) {
//     console.error('Error selecting role:', err);
//     res.status(500).json({ success: false, message: 'Failed to update role' });
//   }
// });


// Endpoint to get service categories (role-based)
app.get('/api/service-categories', async (req, res) => {
  const { role } = req.query; // Pass role as a query parameter

  try {
    if (role === 'taker') {
      // Fetch categories for service takers
      const result = await pool.query('SELECT * FROM Service_Categories ORDER BY category_name');
      res.json({ categories: result.rows });
    } else if (role === 'provider') {
      // Fetch categories for service providers (same categories, but could be filtered)
      const result = await pool.query('SELECT * FROM Service_Categories ORDER BY category_name');
      res.json({ categories: result.rows });
    } else {
      res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ message: 'Error fetching service categories' });
  }
});

// Route to fetch all service categories (no role filtering)
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


// Endpoint to add a new service (only for providers)
app.post('/api/add-service', checkProvider, async (req, res) => {
  const { service_name, description, price, category_id } = req.body;
  const providerId = req.user.id;

  if (!service_name || !description || !price || !category_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Step 1: Check if the service already exists in the `Services` table
    const serviceResult = await pool.query(
      'SELECT * FROM Services WHERE service_name = $1 AND category_id = $2',
      [service_name, category_id]
    );

    let serviceId;
    if (serviceResult.rows.length === 0) {
      // Step 2: If the service does not exist, create a new one
      const newServiceResult = await pool.query(
        `INSERT INTO Services (service_name, description, price, category_id) 
         VALUES ($1, $2, $3, $4) RETURNING service_id`,
        [service_name, description, price, category_id]
      );
      serviceId = newServiceResult.rows[0].service_id;
    } else {
      // Step 3: If the service already exists, get its ID
      serviceId = serviceResult.rows[0].service_id;
    }

    // Step 4: Link the provider with the service in the `Service_Provider_Services` table
    await pool.query(
      `INSERT INTO Service_Provider_Services (provider_id, service_id) 
       VALUES ($1, $2)`,
      [providerId, serviceId]
    );

    res.json({ success: true, message: 'Service added successfully!' });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Error adding service' });
  }
});


// Service Provider Endpoints

// // Add a new service (only for providers)
// app.post('/api/add-service', authenticateUser, checkProvider, async (req, res) => {
//   const { service_name, description, price, category_id } = req.body;
//   const providerId = req.user.id;

//   if (!service_name || !description || !price || !category_id) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     await pool.query(
//       `INSERT INTO Services (service_name, description, price, category_id, provider_id) 
//        VALUES ($1, $2, $3, $4, $5)`,
//       [service_name, description, price, category_id, providerId]
//     );
//     res.json({ success: true, message: 'Service added successfully!' });
//   } catch (error) {
//     console.error('Error adding service:', error);
//     res.status(500).json({ message: 'Error adding service' });
//   }
// });

// Fetch services provided by the logged-in provider
app.get('/api/provider/services', checkProvider, async (req, res) => {
  const providerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT s.service_id, s.service_name, s.description, s.price
       FROM Services s
       WHERE s.provider_id = $1`,
      [providerId]
    );
    res.json({ success: true, services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id, 
        s.service_name, 
        s.description, 
        s.price, 
        sp.provider_id, 
        u.name AS provider_name, 
        sp.rating, 
        sp.total_jobs_completed
      FROM Services s
      JOIN Service_Provider_Services sps ON s.service_id = sps.service_id
      JOIN Service_Providers sp ON sps.provider_id = sp.provider_id
      JOIN Users u ON sp.user_id = u.user_id
      ORDER BY s.service_name, sp.rating DESC
    `);
    
    res.json({ success: true, services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});


// Update an existing service
app.put('/api/provider/update-service/:serviceId', checkProvider, async (req, res) => {
  const { serviceId } = req.params;
  const { service_name, description, price } = req.body;

  try {
    await pool.query(
      `UPDATE Services
       SET service_name = $1, description = $2, price = $3, updated_at = CURRENT_TIMESTAMP
       WHERE service_id = $4 AND provider_id = $5`,
      [service_name, description, price, serviceId, req.user.id]
    );
    res.status(200).json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Delete a service
app.delete('/api/provider/delete-service/:serviceId', checkProvider, async (req, res) => {
  const { serviceId } = req.params;

  try {
    await pool.query('DELETE FROM Services WHERE service_id = $1 AND provider_id = $2', [serviceId, req.user.id]);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});

// Fetch completed jobs or reviews for the service provider
app.get('/api/provider/completed-jobs', checkProvider, async (req, res) => {
  const providerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT b.booking_id, b.status, r.rating, r.comment
       FROM Bookings b
       LEFT JOIN Reviews r ON b.booking_id = r.booking_id
       WHERE b.provider_id = $1 AND b.status = 'completed'`,
      [providerId]
    );
    res.json({ success: true, completedJobs: result.rows });
  } catch (error) {
    console.error('Error fetching completed jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching completed jobs' });
  }
});

// // Service Taker Endpoints

// // Fetch available services
// app.get('/api/services', async (req, res) => {
//   const result = await pool.query(`SELECT * FROM Services`);
//   res.json(result.rows);
// });

// // Fetch past job requests by the service taker
// app.get('/api/taker/past-jobs', async (req, res) => {
//   const userId = req.user.id;

//   const result = await pool.query(
//       `SELECT b.booking_id, s.service_name, b.status
//        FROM Bookings b
//        JOIN Services s ON b.service_id = s.service_id
//        WHERE b.user_id = $1`,
//       [userId]
//   );

//   res.json(result.rows);
// });

// // Fetch profile and reviews of a service provider
// app.get('/api/provider-profile/:providerId', async (req, res) => {
//   const { providerId } = req.params;

//   const result = await pool.query(
//       `SELECT sp.*, AVG(r.rating) as average_rating
//        FROM Service_Providers sp
//        LEFT JOIN Reviews r ON sp.provider_id = r.provider_id
//        WHERE sp.provider_id = $1
//        GROUP BY sp.provider_id`,
//       [providerId]
//   );

//   res.json(result.rows[0]);
// });

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
