import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  // const result = await prisma.user.findMany();
  res.status(200).send({result: "no user"});
})

export default router;