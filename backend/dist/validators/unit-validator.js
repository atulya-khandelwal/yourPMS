"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableUnitsSchema = exports.bookUnitSchema = exports.createUnitSchema = void 0;
const zod_1 = require("zod");
exports.createUnitSchema = zod_1.z.object({
    floor_id: zod_1.z.number().int().positive(),
});
exports.bookUnitSchema = zod_1.z.object({
    unit_id: zod_1.z.number().int().positive()
});
exports.availableUnitsSchema = zod_1.z.object({
    property_id: zod_1.z.number().int().positive()
});
