import type { Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

export async function createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { C_ID, Company_Name, Company_Email, Company_Address, Company_Contact } = req.body as Record<string, string>;
    if (!C_ID || !Company_Name) {
      res.status(400).json({ error: "C_ID and Company_Name are required" });
      return;
    }
    await pool.execute(
      "INSERT INTO Company (C_ID, Company_Name, Company_Email, Company_Address, Company_Contact) VALUES (?, ?, ?, ?, ?)",
      [C_ID, Company_Name, Company_Email ?? null, Company_Address ?? null, Company_Contact ?? null]
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
    const [rows] = await pool.execute(
      "SELECT C_ID, Company_Name, Company_Email, Company_Address, Company_Contact FROM Company ORDER BY C_ID ASC"
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { Company_Name, Company_Email, Company_Address, Company_Contact } = req.body as Record<string, string>;
    if (!Company_Name) {
      res.status(400).json({ error: "Company_Name is required" });
      return;
    }
    const [result]: any = await pool.execute(
      "UPDATE Company SET Company_Name = ?, Company_Email = ?, Company_Address = ?, Company_Contact = ? WHERE C_ID = ?",
      [Company_Name, Company_Email ?? null, Company_Address ?? null, Company_Contact ?? null, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.status(200).json({ message: "Company updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const [result]: any = await pool.execute(
      "DELETE FROM Company WHERE C_ID = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.status(200).json({ message: "Company deleted" });
  } catch (err: any) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      res.status(409).json({ error: "Cannot delete: company has audit sessions referencing it" });
      return;
    }
    next(err);
  }
}
