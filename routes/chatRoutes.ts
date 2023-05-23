import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
} from "../controllers/chatControllers";
const router = Router();

router.route("/").post(requireAuth, accessChat);
router.route("/").get(requireAuth, fetchChats);
router.route("/group").post(requireAuth, createGroupChat);
router.route("/rename").put(requireAuth, renameGroup);
router.route("/add-to-group").put(requireAuth, addToGroup);
router.route("/remove-from-group").put(requireAuth, removeFromGroup);

export { router as chatRoutes };
