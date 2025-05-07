import { Pool } from 'pg';
import configs from '../config'

const pool = new Pool({
    connectionString: configs.serverConfig.DATABASE_URL
})

export default {
    query: (text: string, params?: any[]) => pool.query(text, params),
};