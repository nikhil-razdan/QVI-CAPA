import type { Request, Response } from 'express';
import db from '../config/db.js';
import fs from 'fs';
import path from 'path';

const UPLOAD_ROOT = path.resolve('uploads');

interface IncomingFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: string; // base64
}

function extractQuestionNo(fieldname: string, prefix: string): string | null {
  const match = fieldname.match(new RegExp(`^${prefix}_(\\d+)_(\\d+)$`));
  if (!match) return null;
  return `${match[1]}.${match[2]}`;
}

export const ingestZohoSubmission = async (req: Request, res: Response) => {
  const { fields, files } = req.body as { fields: Record<string, string>; files: IncomingFile[] };

  if (!fields) {
    return res.status(400).json({ error: 'Missing fields payload' });
  }

  const rawSessionId = fields.Session_ID;
  const parsedSessionId = rawSessionId ? parseInt(rawSessionId, 10) : null;

  // Resolve Session_ID against real rows BEFORE insert, so the FK constraint
  // on raw_zoho_submissions never fires. Bad/missing Session_ID -> stored as NULL,
  // payload still logged, nothing gets silently dropped.
  let validSessionId: number | null = null;
  if (parsedSessionId && !Number.isNaN(parsedSessionId)) {
    const [sessionRows]: any = await db.query('SELECT Session_ID FROM Audit_Session WHERE Session_ID = ?', [parsedSessionId]);
    if (sessionRows.length) validSessionId = parsedSessionId;
  }

  try {
    await db.query(
      'INSERT INTO raw_zoho_submissions (Session_ID, payload) VALUES (?, ?)',
      [validSessionId, JSON.stringify({ fields, fileCount: files?.length ?? 0 })]
    );
  } catch (err: any) {
    console.error('[Ingest] Failed to log raw submission:', err.message);
  }

  if (!validSessionId) {
    console.warn(`[Ingest] No matching Audit_Session for Session_ID="${rawSessionId}". Payload logged with Session_ID=NULL.`);
    return res.status(202).json({ success: false, message: 'Logged, but Session_ID did not match an existing session.' });
  }

  // Save photo files to disk under uploads/<Session_ID>/, keyed by field name
  const savedPhotoPaths: Record<string, string> = {};
  if (Array.isArray(files)) {
    const sessionDir = path.join(UPLOAD_ROOT, String(validSessionId));
    fs.mkdirSync(sessionDir, { recursive: true });
    for (const file of files) {
      const safeName = `${file.fieldname}_${Date.now()}_${file.originalname}`.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destPath = path.join(sessionDir, safeName);
      fs.writeFileSync(destPath, Buffer.from(file.buffer, 'base64'));
      savedPhotoPaths[file.fieldname] = path.join(String(validSessionId), safeName);
    }
  }

  // Parse Ans_X_Y / Remark_X_Y fields into per-question answer rows
  const answerMap = new Map<string, { answer?: string; remark?: string }>();
  for (const key of Object.keys(fields)) {
    const ansQ = extractQuestionNo(key, 'Ans');
    if (ansQ) {
      const entry = answerMap.get(ansQ) ?? {};
      entry.answer = fields[key];
      answerMap.set(ansQ, entry);
      continue;
    }
    const remarkQ = extractQuestionNo(key, 'Remark');
    if (remarkQ) {
      const entry = answerMap.get(remarkQ) ?? {};
      entry.remark = fields[key];
      answerMap.set(remarkQ, entry);
    }
  }

  // Attach saved photo paths to their matching question number
  const photoMap = new Map<string, { failPhoto1?: string; failPhoto2?: string; passPhoto?: string }>();
  for (const fieldname of Object.keys(savedPhotoPaths)) {
    const fp1 = extractQuestionNo(fieldname, 'FailPhoto1');
    const fp2 = extractQuestionNo(fieldname, 'FailPhoto2');
    const pp = extractQuestionNo(fieldname, 'PassPhoto');
    const qNo = fp1 ?? fp2 ?? pp;
    if (!qNo) continue;
    const entry = photoMap.get(qNo) ?? {};
    if (fp1) entry.failPhoto1 = savedPhotoPaths[fieldname];
    if (fp2) entry.failPhoto2 = savedPhotoPaths[fieldname];
    if (pp) entry.passPhoto = savedPhotoPaths[fieldname];
    photoMap.set(qNo, entry);
  }

  try {
    for (const [questionNo, { answer, remark }] of answerMap.entries()) {
      const photos = photoMap.get(questionNo) ?? {};
      await db.query(
        `INSERT INTO Audit_Answer (Session_ID, Question_No, Answer, Remark, Fail_Photo_1, Fail_Photo_2, Pass_Photo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [validSessionId, questionNo, answer ?? null, remark ?? null, photos.failPhoto1 ?? null, photos.failPhoto2 ?? null, photos.passPhoto ?? null]
      );
    }

    await db.query(
      'UPDATE Audit_Session SET Status = "Submitted", Updated_At = NOW() WHERE Session_ID = ?',
      [validSessionId]
    );

    res.status(200).json({ success: true, sessionId: validSessionId, questionsIngested: answerMap.size });
  } catch (err: any) {
    console.error('[Ingest] Failed to write Audit_Answer rows:', err.message);
    res.status(500).json({ error: 'Raw submission logged, but answer parsing failed: ' + err.message });
  }
};
