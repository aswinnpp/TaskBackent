import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { RegisterPushTokenUseCase } from "../../application/useCases/RegisterPushTokenUseCase";
import { ApiResponse } from "../presenters/ApiResponse";

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.RegisterPushTokenUseCase)
    private readonly registerPushTokenUseCase: RegisterPushTokenUseCase
  ) {}

  registerToken = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { userId?: string }).userId ?? null;
    const result = await this.registerPushTokenUseCase.execute({
      pushToken: req.body?.pushToken,
      deviceType: req.body?.deviceType,
      userId,
    });
    res.status(200).json(
      ApiResponse.success(result.exists ? "Token already registered" : "Token registered", {
        exists: result.exists,
      })
    );
  };
}

