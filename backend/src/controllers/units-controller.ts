import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import db from '../db'
import { createUnitSchema, bookUnitSchema, availableUnitsSchema } from '../validators/unit-validator';

const addUnit = async (req: Request, res: Response): Promise<any> => {
    try {
        const parseResult = createUnitSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }

        const { floor_id } = parseResult.data;

        // Check if floor exists
        const floorCheck = await db.query('SELECT id FROM floors WHERE id = $1', [floor_id]);
        if (floorCheck.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Floor not found' });
        }

        const maxUnitQuery = await db.query(
            'SELECT MAX(unit_number) as max_number FROM units WHERE floor_id = $1', [floor_id]
        );

        const maxUnitNumber = maxUnitQuery.rows[0].max_number || 0;
        const nextUnitNumber = maxUnitNumber + 1;

        const insertQuery = `
            INSERT INTO units (floor_id, unit_number)
            VALUES ($1, $2)
            RETURNING *;
        `;

        const result = await db.query(insertQuery, [floor_id, nextUnitNumber]);

        return res.status(StatusCodes.CREATED).json(result.rows[0]);

    } catch (error) {
        console.error('Failed to insert unit:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

const bookUnit = async (req: Request, res: Response): Promise<any> => {
    try {
        const unit_id = parseInt(req.params.id, 10)
        if (isNaN(unit_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid unit ID' });
          }
        const parseResult = bookUnitSchema.safeParse({unit_id});

        if (!parseResult.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            });
        }

        const unitCheck = await db.query(
            `SELECT * FROM units WHERE id = $1`, [unit_id]
        );

        if (unitCheck.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Unit Not Found' });
        }

        const currentStatus = unitCheck.rows[0].status;

        const newStatus = currentStatus === 'available' ? 'booked' : 'available';

        const updateResult = await db.query(
            'UPDATE units SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, unit_id]
          );

        return res.status(StatusCodes.OK).json(updateResult.rows[0]);
    } catch (error) {
        console.log('Failed to book unit:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

const availableUnits = async (req: Request, res: Response): Promise<any> => {
    try {
        const property_id = parseInt(req.params.property_id, 10);
        const parseResult = availableUnitsSchema.safeParse({property_id});

        if (!parseResult.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errros: parseResult.error.flatten().fieldErrors,
            });
        }


        const propertyCheck = await db.query('SELECT id FROM properties WHERE id = $1', [property_id]);

        if (propertyCheck.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Property Not Found' });
        }

        const result = await db.query(`
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
        `,
            [property_id]
        );

        return res.status(StatusCodes.OK).json(result.rows);
    } catch (error) {
        console.log('Failed to fetch available units: ', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export { addUnit, bookUnit, availableUnits };