import express from 'express'
import configs from './config'
import cors from 'cors'
import apiRoutes from './routes'

const app = express();

const allowedOrigins = ['https://your-pms.netlify.app'];

// CORS options
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS with specific options
app.use(cors(corsOptions));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello from PMS Backend!')
});

app.use('/api', apiRoutes);

app.listen(configs.serverConfig.PORT, () => {
    console.log("Server is listening on PORT: ", configs.serverConfig.PORT);
})