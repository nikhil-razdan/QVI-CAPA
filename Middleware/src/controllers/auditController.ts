import type { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';

export async function createAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { C_ID, Audit_Type_ID, Status, Level, Date } = req.body;

        if (!C_ID) { res.status(400).json({ error: 'No C_ID' }); return; }
        if (!Audit_Type_ID) { res.status(400).json({ error: 'No Audit_Type_ID' }); return; }

        const query = `
            INSERT INTO Audit_Session(C_ID, Status, Created_At, Updated_At)
            VALUES(?, ?, NOW(), NOW())
        `;
        const [result]: any = await pool.execute(query, [C_ID, Status ?? 'Planned']);
        res.status(201).json({ message: 'Created', insertedID: result.insertId });
    } catch (err) {
        next(err);
    }
}

export async function getAudits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { role, companyID } = req.query;
        let query = 'SELECT * FROM Audit_Session';
        const values: any[] = [];

        if (role === 'Client' && companyID) {
            query = 'SELECT * FROM Audit_Session WHERE C_ID = ?';
            values.push(companyID);
        }

        const [rows] = await pool.execute(query, values);
        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
}
