import { Router, type IRouter } from "express";
import healthRouter from "./health";
import feedbacksRouter from "./feedbacks";
import callbacksRouter from "./callbacks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(feedbacksRouter);
router.use(callbacksRouter);

export default router;
