import { Request, Response } from "express";
import { RoutingRulesService } from "../services/routingRulesService";
import {
  CreateRoutingRulesRequest,
  UpdateRoutingRulesRequest,
  RouteContactRequest,
} from "../types";

export class RoutingRulesController {
  private service: RoutingRulesService;

  constructor() {
    this.service = new RoutingRulesService();
  }

  async createRoutingRules(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateRoutingRulesRequest = req.body;

      if (!request.name || !request.defaultMemberId) {
        res.status(400).json({
          success: false,
          error: "Name and defaultMemberId are required",
        });
        return;
      }

      if (!Array.isArray(request.rules)) {
        res.status(400).json({
          success: false,
          error: "Rules must be an array",
        });
        return;
      }

      const routingRules = await this.service.createRoutingRules(request);
      res.status(201).json({
        success: true,
        data: routingRules,
      });
    } catch (error) {
      console.error("Error creating routing rules:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getRoutingRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Routing rules ID is required",
        });
        return;
      }

      const routingRules = await this.service.getRoutingRules(id);
      if (!routingRules) {
        res.status(404).json({
          success: false,
          error: "Routing rules not found",
        });
        return;
      }

      res.json({
        success: true,
        data: routingRules,
      });
    } catch (error) {
      console.error("Error getting routing rules:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getAllRoutingRules(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: "Invalid pagination parameters",
        });
        return;
      }

      const routingRules = await this.service.getAllRoutingRules();
      res.json({
        success: true,
        data: routingRules,
        pagination: {
          page,
          limit,
          total: routingRules.length,
        },
      });
    } catch (error) {
      console.error("Error getting all routing rules:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async updateRoutingRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateRoutingRulesRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Routing rules ID is required",
        });
        return;
      }

      if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: "Update data is required",
        });
        return;
      }

      const routingRules = await this.service.updateRoutingRules(id, updates);
      if (!routingRules) {
        res.status(404).json({
          success: false,
          error: "Routing rules not found",
        });
        return;
      }

      res.json({
        success: true,
        data: routingRules,
      });
    } catch (error) {
      console.error("Error updating routing rules:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async deleteRoutingRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Routing rules ID is required",
        });
        return;
      }

      const deleted = await this.service.deleteRoutingRules(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Routing rules not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Routing rules deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting routing rules:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async routeContact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request: RouteContactRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Routing rules ID is required",
        });
        return;
      }

      if (!request.contactInfo) {
        res.status(400).json({
          success: false,
          error: "Contact information is required",
        });
        return;
      }

      const result = await this.service.routeContact(id, request.contactInfo);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error routing contact:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
