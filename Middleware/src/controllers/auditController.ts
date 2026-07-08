import type { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';

export async function createAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { C_ID, Form_ID, Level, Status } = req.body;

        if (!C_ID) { res.status(400).json({ error: 'No C_ID' }); return; }
        if (!Form_ID) { res.status(400).json({ error: 'No Form_ID' }); return; }
        if (!Level) { res.status(400).json({ error: 'No Level' }); return; }

        const [companyRows]: any = await pool.execute(
            'SELECT Company_Name FROM Company WHERE C_ID = ?',
            [C_ID]
        );
        if (companyRows.length === 0) {
            res.status(404).json({ error: 'Company not found' });
            return;
        }
        const Company_Name = companyRows[0].Company_Name;

        const query = `
            INSERT INTO Audit_Session(C_ID, Company_Name, Form_ID, Level, Status, Created_At, Updated_At)
            VALUES(?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const [result]: any = await pool.execute(query, [C_ID, Company_Name, Form_ID, Level, Status ?? 'Planned']);
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

export async function ingestAuditSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fields, files } = req.body as {
      fields: Record<string, string>;
      files: { fieldname: string; originalname: string; mimetype: string; size: number; buffer: string }[];
    };

    if (!fields) {
      res.status(400).json({ error: 'No fields in payload' });
      return;
    }

    const strippedFiles = (files ?? []).map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));
    await pool.execute(
      'INSERT INTO raw_zoho_submissions (payload, received_at) VALUES (?, NOW())',
      [JSON.stringify({ fields, files: strippedFiles })]
    );

    // TODO:Config acc to payload choice, no base64 buffer for files.

    res.status(200).json({ message: 'Ingested (raw only — field mapping not yet implemented)' });
  } catch (err) {
    next(err);
  }
}
