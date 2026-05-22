import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { sommelierRouter } from "./sommelier";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/sommelier", sommelierRouter);

export default router;
