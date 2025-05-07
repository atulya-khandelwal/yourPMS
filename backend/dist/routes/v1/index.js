"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyRoutes_1 = __importDefault(require("./propertyRoutes"));
const floorRoutes_1 = __importDefault(require("./floorRoutes"));
const unitRoutes_1 = __importDefault(require("./unitRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const router = express_1.default.Router();
router.use('/properties', propertyRoutes_1.default);
router.use('/floors', floorRoutes_1.default);
router.use('/units', unitRoutes_1.default);
router.use('/auth', authRoutes_1.default);
exports.default = router;
