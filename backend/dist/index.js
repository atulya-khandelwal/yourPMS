"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const allowedOrigins = ['https://your-pms.netlify.app'];
// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Apply CORS with specific options
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.listen(config_1.default.serverConfig.PORT, () => {
    console.log("Server is listening on PORT: ", config_1.default.serverConfig.PORT);
});
