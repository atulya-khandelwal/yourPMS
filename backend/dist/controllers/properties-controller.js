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
exports.getAllProperties = exports.propertyDetails = exports.addProperty = void 0;
const http_status_codes_1 = require("http-status-codes");
const db_1 = __importDefault(require("../db"));
const property_validator_1 = require("../validators/property-validator");
const addProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = property_validator_1.createPropertySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { name, address, user_id } = parseResult.data;
        const userCheck = yield db_1.default.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'User Not Found' });
        }
        const propertyResult = yield db_1.default.query('SELECT MAX(property_number) AS max_property FROM properties WHERE user_id = $1', [user_id]);
        const nextPropertyNumber = (propertyResult.rows[0].max_property || 0) + 1;
        const query = 'INSERT INTO properties (name, address, user_id, property_number) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, address, user_id, nextPropertyNumber];
        const result = yield db_1.default.query(query, values);
        console.log('Property added:', result.rows[0]);
        const propertyId = result.rows[0].id;
        return res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: 'Property created successfully',
            propertyId,
            success: true
        });
    }
    catch (error) {
        console.error('Failed to insert property:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});
exports.addProperty = addProperty;
const propertyDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = parseInt(req.params.id, 10);
        if (isNaN(propertyId)) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                error: 'Invalid propertyID'
            });
        }
        // Get Property
        const propertyQuery = 'SELECT * FROM properties WHERE id = $1';
        const propertyValues = [propertyId];
        const propertyResult = yield db_1.default.query(propertyQuery, propertyValues);
        if (propertyResult.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Property not found' });
        }
        const property = propertyResult.rows[0];
        // Get floors for the property
        const floorQuery = 'SELECT * FROM floors WHERE property_id = $1';
        const floorValues = [propertyId];
        const floorResult = yield db_1.default.query(floorQuery, floorValues);
        const floors = yield Promise.all(floorResult.rows.map((floor) => __awaiter(void 0, void 0, void 0, function* () {
            // Get Units for each floor
            const unitsQuery = 'SELECT * FROM units WHERE floor_id = $1';
            const unitsValues = [floor.id];
            const unitsResult = yield db_1.default.query(unitsQuery, unitsValues);
            return Object.assign(Object.assign({}, floor), { units: unitsResult.rows });
        })));
        // Attach floors to property
        const fullDetails = Object.assign(Object.assign({}, property), { floors });
        return res.status(http_status_codes_1.StatusCodes.OK).json(fullDetails);
    }
    catch (error) {
        console.error('Failed to fetch property details:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.propertyDetails = propertyDetails;
const getAllProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.query.userId, 10);
        if (isNaN(userId)) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                error: 'Invalid userID'
            });
        }
        const query = 'SELECT * FROM properties WHERE user_id = $1 ORDER BY id ASC';
        const values = [userId];
        const result = yield db_1.default.query(query, values);
        if (result.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'No properties found for this user' });
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json(result.rows);
    }
    catch (error) {
        console.error('Failed to fetch properties:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});
exports.getAllProperties = getAllProperties;
