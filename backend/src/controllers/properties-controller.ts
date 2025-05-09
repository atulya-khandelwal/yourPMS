import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
import db from '../db'
import { createPropertySchema } from "../validators/property-validator";

const addProperty = async (req: Request, res: Response): Promise<any> => {
    try {
        const parseResult = createPropertySchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: parseResult.error.flatten().fieldErrors,
            })
        }

        const { name, address, user_id } = parseResult.data;

        const userCheck = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );
        
        if (userCheck.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User Not Found' });
        }

        const propertyResult = await db.query(
            'SELECT MAX(property_number) AS max_property FROM properties WHERE user_id = $1',
            [user_id]
        );
        
        const nextPropertyNumber = (propertyResult.rows[0].max_property || 0) + 1;

        const query = 'INSERT INTO properties (name, address, user_id, property_number) VALUES ($1, $2, $3, $4) RETURNING *'
        const values = [name, address, user_id, nextPropertyNumber];
        const result = await db.query(query, values);
        
        const propertyId = result.rows[0].id;
        return res.status(StatusCodes.CREATED).json({
            message: 'Property created successfully',
            propertyId,
            success: true
        });
    } catch (error) {
        console.error('Failed to insert property:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
}

const propertyDetails = async (req: Request, res: Response): Promise<any> => {
    try {
        const propertyId = parseInt(req.params.id, 10);

        if (isNaN(propertyId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid propertyID'
            })
        }

        // Get Property
        const propertyQuery = 'SELECT * FROM properties WHERE id = $1';
        const propertyValues = [propertyId];

        const propertyResult = await db.query(propertyQuery, propertyValues);

        if (propertyResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Property not found' });
        }

        const property = propertyResult.rows[0];

        // Get floors for the property
        const floorQuery = 'SELECT * FROM floors WHERE property_id = $1'
        const floorValues = [propertyId]
        const floorResult = await db.query(floorQuery, floorValues);

        const floors = await Promise.all(
            floorResult.rows.map(async (floor) => {
                // Get Units for each floor
                const unitsQuery = 'SELECT * FROM units WHERE floor_id = $1'
                const unitsValues = [floor.id];
                const unitsResult = await db.query(unitsQuery, unitsValues);

                return {
                    ...floor,
                    units: unitsResult.rows
                };
            })
        );

        // Attach floors to property
        const fullDetails = {
            ...property,
            floors
        };
      
        return res.status(StatusCodes.OK).json(fullDetails);
    } catch (error) {
        console.error('Failed to fetch property details:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

const getAllProperties = async (req: Request, res: Response): Promise<any> => { 
    try {
        const userId = parseInt(req.query.userId as string, 10);
        

        if (isNaN(userId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid userID'
            })
        }

        const query = 'SELECT * FROM properties WHERE user_id = $1 ORDER BY id ASC';
        const values = [userId];
        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'No properties found for this user' });
        }

        return res.status(StatusCodes.OK).json(result.rows);
    } catch (error) {
        console.error('Failed to fetch properties:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

export { addProperty, propertyDetails,getAllProperties }