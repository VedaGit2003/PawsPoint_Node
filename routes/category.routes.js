import { Router } from "express";
import { createCategoryController } from "../controllers/category.controller.js";


const router=Router();

router.post('/create-category',createCategoryController)

export default router;