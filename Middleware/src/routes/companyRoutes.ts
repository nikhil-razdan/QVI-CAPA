import { Router } from "express";
import { createCompany, getCompanies, updateCompany, deleteCompany } from "../controllers/companyController.js";

const router = Router();
router.post("/create", createCompany);
router.get("/", getCompanies);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
