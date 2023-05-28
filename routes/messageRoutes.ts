import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { allMessages, sendMessage } from "../controllers/messageControllers";
const router = Router();

router.route("/").post(requireAuth, sendMessage);
router.route("/:chatId").get(requireAuth, allMessages);

export { router as messageRoutes };
