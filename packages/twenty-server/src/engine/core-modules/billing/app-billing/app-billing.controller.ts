/* @license Enterprise */

import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Belt-and-suspenders cap: LogicFunctionExecutorService already throttles
// executions, but application-access tokens are plain JWTs that an exfiltrating
// app could use outside the logic-function runtime. Same budget shape as the
// execution throttle — 1000 charges / 60s / (workspace, application) — so no
// legitimate batch hits the ceiling.
const APP_BILLING_CHARGE_THROTTLE_LIMIT = 1000;
const APP_BILLING_CHARGE_THROTTLE_TTL_MS = 60_000;

@Controller('app/billing')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class AppBillingController {
  constructor(
    private readonly appBillingService: AppBillingService,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Post('charge')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async charge(
    @Req() request: Request,
    @Body() charge: ChargeDto,
  ): Promise<void> {
    // When billing is disabled the USAGE_RECORDED listener is a no-op, so
    // this endpoint is pure overhead. Return 404 so apps running against a
    // Community instance fail fast instead of silently discarding charges.
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      throw new NotFoundException();
    }

    // JwtAuthGuard accepts any valid token type (user, api-key,
    // application-access). `request.application` is only populated for
    // application-access tokens — reject other authenticated callers here
    // since this endpoint exists so installed apps can self-report usage.
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `${request.workspace.id}-${request.application.id}-app-billing-charge`,
      1,
      APP_BILLING_CHARGE_THROTTLE_LIMIT,
      APP_BILLING_CHARGE_THROTTLE_TTL_MS,
    );

    this.appBillingService.emitChargeEvent({
      workspaceId: request.workspace.id,
      applicationId: request.application.id,
      userWorkspaceId: request.userWorkspaceId,
      charge,
    });
  }
}
