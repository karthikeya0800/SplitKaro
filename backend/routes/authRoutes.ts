import { Router } from "express";
import {
  register,
  login,
  updateUser,
  deleteUser,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
