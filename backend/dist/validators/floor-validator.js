"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFloorSchema = void 0;
const zod_1 = require("zod");
exports.createFloorSchema = zod_1.z.object({
    property_id: zod_1.z.number().int().positive(),
});
