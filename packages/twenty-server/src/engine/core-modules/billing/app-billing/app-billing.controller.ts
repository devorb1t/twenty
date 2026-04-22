import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('app/billing')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class AppBillingController {
  constructor(private readonly appBillingService: AppBillingService) {}

  @Post('charge')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async charge(
    @Req() request: Request,
    @Body() charge: ChargeDto,
  ): Promise<{ success: true }> {
    // JwtAuthGuard accepts any valid token type (user, api-key,
    // application-access). `request.application` is only populated for
    // application-access tokens — reject other authenticated callers here
    // since this endpoint exists so installed apps can self-report usage.
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    this.appBillingService.emitChargeEvent({
      workspaceId: request.workspace.id,
      applicationId: request.application.id,
      userWorkspaceId: request.userWorkspaceId,
      charge,
    });

    return { success: true };
  }
}
