import { createFloorSchema} from '../validators/floor-validator';
import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import db from '../db'


const addFloors = async (req: Request, res: Response): Promise<any> => {
    try {
        const parseResult = createFloorSchema.safeParse(req.body);

        if (!parseResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: parseResult.error.flatten().fieldErrors,
        });
        }

        const { property_id } = parseResult.data;

        // Check if the property exists
        const propertyCheck = await db.query(
            'SELECT id FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Property Not Found' });
        }

        const floorResult = await db.query(
            'SELECT MAX(floor_number) AS max_floor FROM floors WHERE property_id = $1',
            [property_id]
        );

        const nextFloorNumber = (floorResult.rows[0].max_floor || 0) + 1;

        // Insert The floor
        const insertQuery = 'INSERT INTO floors (property_id, floor_number) VALUES ($1, $2) RETURNING *';
        const values = [property_id, nextFloorNumber];

        const result = await db.query(insertQuery, values);

        return res.status(StatusCodes.CREATED).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating floor:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

export { addFloors };