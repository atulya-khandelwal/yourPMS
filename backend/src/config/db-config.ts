import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
    // Your existing database configuration
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME
}

export default dbConfig