import { Router } from "express";
import { createCompany, getCompanies } from "../controllers/companyController.js";

const router = Router();
router.post("/create", createCompany);
router.get("/", getCompanies);

export default router;
