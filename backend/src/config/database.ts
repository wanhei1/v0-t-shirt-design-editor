import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectToDatabase = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }

    return client;
};

export default connectToDatabase;