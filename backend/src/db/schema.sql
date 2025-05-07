CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  refresh_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY, 
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    property_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floors (
  id SERIAL PRIMARY KEY,
  property_id INT REFERENCES properties(id) ON DELETE CASCADE,
  floor_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, floor_number)
);

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  floor_id INT REFERENCES floors(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(floor_id, unit_number)
);


