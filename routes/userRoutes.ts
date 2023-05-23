import { Router } from "express";
import { getAllUsers, login, register } from "../controllers/userControllers";
import { requireAuth } from "../middlewares/requireAuth";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", requireAuth, getAllUsers);

export { router as userRoutes };
