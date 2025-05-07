"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFloors = void 0;
const floor_validator_1 = require("../validators/floor-validator");
const http_status_codes_1 = require("http-status-codes");
const db_1 = __importDefault(require("../db"));
const addFloors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = floor_validator_1.createFloorSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { property_id } = parseResult.data;
        // Check if the property exists
        const propertyCheck = yield db_1.default.query('SELECT id FROM properties WHERE id = $1', [property_id]);
        if (propertyCheck.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Property Not Found' });
        }
        const floorResult = yield db_1.default.query('SELECT MAX(floor_number) AS max_floor FROM floors WHERE property_id = $1', [property_id]);
        const nextFloorNumber = (floorResult.rows[0].max_floor || 0) + 1;
        // Insert The floor
        const insertQuery = 'INSERT INTO floors (property_id, floor_number) VALUES ($1, $2) RETURNING *';
        const values = [property_id, nextFloorNumber];
        const result = yield db_1.default.query(insertQuery, values);
        return res.status(http_status_codes_1.StatusCodes.CREATED).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating floor:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.addFloors = addFloors;
