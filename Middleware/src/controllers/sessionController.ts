import type { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      C_ID, Company_Name, QMS_Head_Name, QMS_Head_Email,
      QMS_Head_Phone, Date_Of_Audit,
      Opening_Start_HH, Opening_Start_MM, Opening_Start_AMPM,
      Opening_End_HH, Opening_End_MM, Opening_End_AMPM,
      Total_Members, Auditor_ID, Auditor_Name
    } = req.body as Record<string, string>;

    if (!C_ID || !Company_Name) {
      res.status(400).json({ error: 'C_ID and Company_Name are required' });
      return;
    }

    const query = `
    INSERT INTO Audit_Session (
    C_ID, Company_Name, QMS_Head_Name, QMS_Head_Email,
    QMS_Head_Phone, Date_Of_Audit,
    Opening_Start_HH, Opening_Start_MM, Opening_Start_AMPM,
    Opening_End_HH, Opening_End_MM, Opening_End_AMPM,
    Total_Members, Auditor_ID, Auditor_Name
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;
    const values = [
      C_ID, Company_Name,
      QMS_Head_Name ?? null,
      QMS_Head_Email ?? null,
      QMS_Head_Phone ?? null,
      Date_Of_Audit ?? null,
      Opening_Start_HH ?? null,
      Opening_Start_MM ?? null,
      Opening_Start_AMPM ?? null,
      Opening_End_HH ?? null,
      Opening_End_MM ?? null,
      Opening_End_AMPM ?? null,
      Total_Members ?? null,
      Auditor_ID ?? null,
      Auditor_Name ?? null
    ];

    const [result]: any = await pool.execute(query, values);
    res.status(201).json({ message: 'Session created', sessionID: result.insertId });
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute('SELECT * FROM Audit_Session ORDER BY Created_At DESC');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
