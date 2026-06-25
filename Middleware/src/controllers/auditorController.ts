import type { Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

export async function createAuditor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { A_ID, Auditor_Name, Certification } = req.body as Record<string, string>;
    if (!A_ID || !Auditor_Name) {
      res.status(400).json({ error: "A_ID and Auditor_Name are required" });
      return;
    }
    await pool.execute(
      "INSERT INTO Auditor (A_ID, Auditor_Name, Certification) VALUES (?, ?, ?)",
      [A_ID, Auditor_Name, Certification ?? null]
    );
    res.status(201).json({ message: "Auditor created" });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Auditor ID already exists" });
      return;
    }
    next(err);
  }
}

export async function getAuditors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute("SELECT A_ID, Auditor_Name, Certification FROM Auditor ORDER BY A_ID ASC");
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateAuditor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { Auditor_Name, Certification } = req.body as Record<string, string>;
    if (!Auditor_Name) {
      res.status(400).json({ error: "Auditor_Name is required" });
      return;
    }
    const [result]: any = await pool.execute(
      "UPDATE Auditor SET Auditor_Name = ?, Certification = ? WHERE A_ID = ?",
      [Auditor_Name, Certification ?? null, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Auditor not found" });
      return;
    }
    res.status(200).json({ message: "Auditor updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteAuditor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const [result]: any = await pool.execute(
      "DELETE FROM Auditor WHERE A_ID = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Auditor not found" });
      return;
    }
    res.status(200).json({ message: "Auditor deleted" });
  } catch (err) {
    next(err);
  }
}
