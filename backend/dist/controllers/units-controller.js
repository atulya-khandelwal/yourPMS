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
exports.availableUnits = exports.bookUnit = exports.addUnit = void 0;
const http_status_codes_1 = require("http-status-codes");
const db_1 = __importDefault(require("../db"));
const unit_validator_1 = require("../validators/unit-validator");
const addUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = unit_validator_1.createUnitSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { floor_id } = parseResult.data;
        // Check if floor exists
        const floorCheck = yield db_1.default.query('SELECT id FROM floors WHERE id = $1', [floor_id]);
        if (floorCheck.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Floor not found' });
        }
        const maxUnitQuery = yield db_1.default.query('SELECT MAX(unit_number) as max_number FROM units WHERE floor_id = $1', [floor_id]);
        const maxUnitNumber = maxUnitQuery.rows[0].max_number || 0;
        const nextUnitNumber = maxUnitNumber + 1;
        const insertQuery = `
            INSERT INTO units (floor_id, unit_number)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = yield db_1.default.query(insertQuery, [floor_id, nextUnitNumber]);
        return res.status(http_status_codes_1.StatusCodes.CREATED).json(result.rows[0]);
    }
    catch (error) {
        console.error('Failed to insert unit:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.addUnit = addUnit;
const bookUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unit_id = parseInt(req.params.id, 10);
        if (isNaN(unit_id)) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Invalid unit ID' });
        }
        const parseResult = unit_validator_1.bookUnitSchema.safeParse({ unit_id });
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const unitCheck = yield db_1.default.query(`SELECT * FROM units WHERE id = $1`, [unit_id]);
        if (unitCheck.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Unit Not Found' });
        }
        const currentStatus = unitCheck.rows[0].status;
        const newStatus = currentStatus === 'available' ? 'booked' : 'available';
        const updateResult = yield db_1.default.query('UPDATE units SET status = $1 WHERE id = $2 RETURNING *', [newStatus, unit_id]);
        return res.status(http_status_codes_1.StatusCodes.OK).json(updateResult.rows[0]);
    }
    catch (error) {
        console.log('Failed to book unit:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.bookUnit = bookUnit;
const availableUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property_id = parseInt(req.params.property_id, 10);
        const parseResult = unit_validator_1.availableUnitsSchema.safeParse({ property_id });
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                errros: parseResult.error.flatten().fieldErrors,
            });
        }
        const propertyCheck = yield db_1.default.query('SELECT id FROM properties WHERE id = $1', [property_id]);
        if (propertyCheck.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Property Not Found' });
        }
        const result = yield db_1.default.query(`
            SELECT
                u.id as unit_id,
                u.unit_number,
                u.status,
                f.id as floor_id,
                f.floor_number
            FROM units u
            JOIN floors f ON u.floor_id = f.id
            WHERE f.property_id = $1 AND u.status = 'available'
            ORDER BY f.floor_number, u.unit_number    
        `, [property_id]);
        return res.status(http_status_codes_1.StatusCodes.OK).json(result.rows);
    }
    catch (error) {
        console.log('Failed to fetch available units: ', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.availableUnits = availableUnits;
