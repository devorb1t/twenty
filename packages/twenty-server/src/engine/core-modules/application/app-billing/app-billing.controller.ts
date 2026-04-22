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

import { AppBillingService } from 'src/engine/core-modules/application/app-billing/app-billing.service';
import { ChargeDto } from 'src/engine/core-modules/application/app-billing/dtos/charge.dto';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// JwtAuthGuard validates the bearer token (including APPLICATION_ACCESS
// tokens — see jwt-auth.guard.ts) and binds `application`, `workspace`,
// and optional user fields onto the request. WorkspaceAuthGuard then
// asserts that the workspace is present; NoPermissionGuard marks this
// endpoint as not gated by role permissions because the app token itself
// is the authorization.
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
    // JwtAuthGuard may accept a valid non-application token (user access
    // token, api key) that still populates `workspace`. Reject those with
    // 403 — the caller is authenticated, just not authorized for an app-
    // only endpoint.
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token. The caller must be a logic function running inside an installed application.',
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
