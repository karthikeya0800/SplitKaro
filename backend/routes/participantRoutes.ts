import { Router } from "express";
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  createMultipleParticipants,
} from "../controllers/participantController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", getParticipants);
router.post("/", createParticipant);
router.post("/multiple", createMultipleParticipants);
router.put("/:id", updateParticipant);
router.delete("/:id", deleteParticipant);

export default router;
