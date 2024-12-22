-- Updated USERS table
CREATE TABLE users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  
    email VARCHAR(255) UNIQUE NOT NULL,                  
    password_hash TEXT NOT NULL,                         
    name VARCHAR(255) NOT NULL,                          
    phone_number VARCHAR(15) NOT NULL,                   
    address TEXT NOT NULL,                               
    city VARCHAR(100) NOT NULL, 
    role VARCHAR(50),                         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP       
);


-- Create the Service Categories Table
CREATE TABLE Service_Categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Populate initial service categories
INSERT INTO Service_Categories (category_name, description)
VALUES 
('Plumbing', 'All plumbing related services'),
('Carpentry', 'Woodwork and furniture services'),
('Cleaning', 'Household or office cleaning services'),
('RO Fitting', 'Installation and maintenance of RO systems'),
('AC Repair', 'Repair and maintenance of air conditioners'),
('Washing Machine Repair', 'Repair of washing machines'),
('Refrigerator Repair', 'Repair of refrigerators'),
('Cooking Person', 'Personal chef or cook services'),
('Other', 'Any other specialized services');

-- Create the Services Table
CREATE TABLE Services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category_id UUID REFERENCES Service_Categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Service Providers Table
CREATE TABLE Service_Providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(user_id),
    rating FLOAT DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    availability VARCHAR(20) CHECK (availability IN ('available', 'busy', 'offline')),
    city VARCHAR(100),
    notifications INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Join Table: Service_Provider_Services (for linking providers with offered services)
CREATE TABLE Service_Provider_Services (
    provider_service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES Service_Providers(provider_id) ON DELETE CASCADE,
    service_id UUID REFERENCES Services(service_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Bookings (
    booking_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users(user_id),
    service_id UUID REFERENCES Services(service_id),
    provider_id UUID REFERENCES Service_Providers(provider_id),
    booking_time TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')), -- Enum for booking status
    requested_date DATE NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('unpaid', 'paid', 'refund_initiated')), -- Enum for payment status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payments Table
-- A table to handle payment details (optional, but can track payments better).

CREATE TABLE Payments (
    payment_id UUID PRIMARY KEY,
    booking_id UUID REFERENCES Bookings(booking_id),
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) CHECK (payment_status IN ('successful', 'failed', 'pending')), -- Enum for payment outcome
    transaction_id VARCHAR(255),
    payment_gateway VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

7. Reviews Table(OPTIONAL)
This table stores feedback given by users for the service they received.

CREATE TABLE Reviews (
    review_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users(user_id),
    provider_id UUID REFERENCES Service_Providers(provider_id),
    booking_id UUID REFERENCES Bookings(booking_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Ratings between 1 and 5
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY, -- or AUTO_INCREMENT for MySQL
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
