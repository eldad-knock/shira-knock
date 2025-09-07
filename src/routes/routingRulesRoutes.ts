import { Router, type Router as ExpressRouter } from "express";
import { RoutingRulesController } from "../controllers/routingRulesController";
import {
  validateContactInfoMiddleware,
  validateRoutingRulesMiddleware,
} from "../validation/contactValidation";

const router: ExpressRouter = Router();
const controller = new RoutingRulesController();

router.post(
  "/",
  validateRoutingRulesMiddleware,
  controller.createRoutingRules.bind(controller)
);

router.get("/", controller.getAllRoutingRules.bind(controller));

router.get("/:id", controller.getRoutingRules.bind(controller));

router.put(
  "/:id",
  validateRoutingRulesMiddleware,
  controller.updateRoutingRules.bind(controller)
);

router.delete("/:id", controller.deleteRoutingRules.bind(controller));

router.post(
  "/:id/route",
  validateContactInfoMiddleware,
  controller.routeContact.bind(controller)
);

export default router;
