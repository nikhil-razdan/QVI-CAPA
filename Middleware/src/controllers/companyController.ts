import type { Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

export async function createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { C_ID, Company_Name } = req.body as Record<string, string>;
    if (!C_ID || !Company_Name) {
      res.status(400).json({ error: "C_ID and Company_Name are required" });
      return;
    }
    await pool.execute(
      "INSERT INTO Company (C_ID, Company_Name) VALUES (?, ?)",
      [C_ID, Company_Name]
    );
    res.status(201).json({ message: "Company created" });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Company ID already exists" });
      return;
    }
    next(err);
  }
}

export async function getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute("SELECT C_ID, Company_Name FROM Company ORDER BY Company_Name ASC");
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
