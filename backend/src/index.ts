import express from 'express'
import configs from './config'
import cors from 'cors'
import apiRoutes from './routes'

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(configs.serverConfig.PORT, () => {
    console.log("Server is listening on PORT: ", configs.serverConfig.PORT);
})