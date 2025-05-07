"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPropertySchema = void 0;
const zod_1 = require("zod");
exports.createPropertySchema = zod_1.z.object({
    user_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1, 'Name is required'),
    address: zod_1.z.string(),
});
