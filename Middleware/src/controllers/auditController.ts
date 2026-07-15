import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import db from '../config/db.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function processLoopCascader(sessionId: number, targetIndex: number) {
  const [sessions]: any = await db.query('SELECT * FROM Audit_Session WHERE Session_ID = ?', [sessionId]);
  if (!sessions || sessions.length === 0) return;
  const currentSession = sessions[0];

  const [auditors]: any = await db.query('SELECT * FROM Auditor ORDER BY Created_At ASC');

  if (targetIndex >= auditors.length) {
    await db.query('UPDATE Audit_Session SET Status = "Failed" WHERE Session_ID = ?', [sessionId]);
    console.log(`[QVI-CAPA Error] Cascading loop exhausted for session: ${sessionId}.`);
    return;
  }

  const assignedAuditor = auditors[targetIndex];

  await db.query(
    `UPDATE Audit_Session 
     SET Auditor_ID = ?, Auditor_Name = ?, Status = 'Scheduled', Updated_At = NOW() 
     WHERE Session_ID = ?`,
    [assignedAuditor.A_ID, assignedAuditor.Auditor_Name, sessionId]
  );

  const loopToken = jwt.sign(
    { sessionId, auditorId: assignedAuditor.A_ID, loopIndex: targetIndex },
    process.env.JWT_SECRET || 'qvi_capa_default_secret_2026',
    { expiresIn: '24h' }
  );

  const baseGatewayUrl = `http://localhost:5000/api/audits/loop-handshake`;
  const acceptActionLink = `${baseGatewayUrl}?token=${loopToken}&response=accept`;
  const declineActionLink = `${baseGatewayUrl}?token=${loopToken}&response=decline`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: assignedAuditor.Auditor_Email,
    subject: `QVI-CAPA Assignment Request: ${currentSession.Company_Name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a;">Audit Scheduling Matrix Notification</h2>
        <p>Hello <b>${assignedAuditor.Auditor_Name}</b>,</p>
        <p>You have been routed to execute a compliance review for: <b>${currentSession.Company_Name}</b>.</p>
        <p>Target Date Lock: <b>${currentSession.Date_Of_Audit}</b></p>
        <div style="margin-top: 25px;">
          <a href="${acceptActionLink}" style="background: #166534; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Accept Request</a>
          <a href="${declineActionLink}" style="background: #991b1b; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Decline Request</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">This request expires automatically within 24 hours.</p>
      </div>
    `
  });
}

export const scheduleAuditSession = async (req: Request, res: Response) => {
  const { c_id, company_name, date_of_audit, auditor_id } = req.body;
  try {
    const [result]: any = await db.query(
      `INSERT INTO Audit_Session (C_ID, Company_Name, Date_Of_Audit, Status, Form_ID, Level) 
       VALUES (?, ?, ?, 'Draft', 1, 1)`,
      [c_id, company_name, date_of_audit]
    );

    const createdSessionId = result.insertId;

    let startIndex = 0;
    if (auditor_id) {
      const [auditors]: any = await db.query('SELECT A_ID FROM Auditor ORDER BY Created_At ASC');
      const foundIndex = auditors.findIndex((a: any) => a.A_ID === auditor_id);
      if (foundIndex !== -1) startIndex = foundIndex;
    }

    await processLoopCascader(createdSessionId, startIndex);

    res.status(201).json({ success: true, message: 'Cascading scheduling link built successfully.', sessionId: createdSessionId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createManualAuditSession = async (req: Request, res: Response) => {
  const { C_ID, Form_ID, Level, Auditor_ID, Auditor_Name, Status } = req.body;

  if (!C_ID || !Form_ID || !Level) {
    return res.status(400).json({ error: 'C_ID, Form_ID, and Level are required.' });
  }

  try {
    const [companyRows]: any = await db.query(
      'SELECT Company_Name FROM Company WHERE C_ID = ?',
      [C_ID]
    );
    if (!companyRows.length) {
      return res.status(404).json({ error: 'Company not found for provided C_ID.' });
    }

    const [result]: any = await db.query(
      `INSERT INTO Audit_Session (C_ID, Company_Name, Auditor_ID, Auditor_Name, Status, Form_ID, Level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        C_ID,
        companyRows[0].Company_Name,
        Auditor_ID || null,
        Auditor_Name || null,
        Status || 'Planned',
        Form_ID,
        Level,
      ]
    );

    res.status(201).json({ success: true, sessionId: result.insertId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const processLoopHandshake = async (req: Request, res: Response) => {
    const { token, response } = req.query;
    try {
      const decodedPayload: any = jwt.verify(String(token), process.env.JWT_SECRET || 'qvi_capa_default_secret_2026');

      const [sessions]: any = await db.query(
        'SELECT s.*, c.Company_Email FROM Audit_Session s JOIN Company c ON s.C_ID = c.C_ID WHERE s.Session_ID = ?', 
        [decodedPayload.sessionId]
      );
      if (!sessions.length) return res.status(404).send('<h1>Audit Session log missing.</h1>');
      const sessionInstance = sessions[0];

      if (response === 'accept') {
        await db.query(
          'UPDATE Audit_Session SET Status = "Scheduled", Updated_At = NOW() WHERE Session_ID = ?', 
          [decodedPayload.sessionId]
        );

        if (sessionInstance.Company_Email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: sessionInstance.Company_Email,
                subject: `QVI-CAPA Schedule Lock: Handshake Finalized`,
                html: `<p>A certified inspector has accepted your system request. Your audit date on <b>${sessionInstance.Date_Of_Audit}</b> is officially confirmed.</p>`
            });
        }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/audit-verification/gateway?session_id=${decodedPayload.sessionId}&auditor_id=${decodedPayload.auditorId}`);
      } else {
        const subsequentIndex = decodedPayload.loopIndex + 1;
        res.send('<h1>Assignment declined. Escalating slot criteria down the chain...</h1>');
        await processLoopCascader(decodedPayload.sessionId, subsequentIndex);
      }
    } catch (err) {
      res.status(400).send('<h1>Token verification failed or link signature altered.</h1>');
    }
};

export const verifyGateCheckpoint = async (req: Request, res: Response) => {
  const { session_id, auditor_id } = req.query;
  try {
    const [rows]: any = await db.query(
      `SELECT s.Session_ID, s.C_ID, s.Company_Name, s.Date_Of_Audit, s.Auditor_ID, s.Auditor_Name, c.Company_Email, c.Company_Address
       FROM Audit_Session s
       JOIN Company c ON s.C_ID = c.C_ID
       WHERE s.Session_ID = ? AND s.Auditor_ID = ?`,
      [session_id, auditor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ verified: false, message: 'Gateway Checkpoint Blocked: Invalid session keys.' });
    }
    res.json({ verified: true, data: rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCalendarFeed = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT Session_ID, Company_Name, Auditor_Name, Date_Of_Audit, Status
       FROM Audit_Session
       WHERE Status IN ('Scheduled', 'Submitted')
       ORDER BY Date_Of_Audit ASC`
    );
    res.status(200).json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
