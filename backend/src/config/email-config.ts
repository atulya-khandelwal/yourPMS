import dotenv from 'dotenv'

dotenv.config();

const emailConfig = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER ,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    FROM_EMAIL: process.env.FROM_EMAIL,
    FROM_NAME: process.env.FROM_NAME
}
  
export default emailConfig;