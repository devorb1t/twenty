import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

import { AppBillingService } from 'src/engine/core-modules/application/app-billing/app-billing.service';
import { ChargeDto } from 'src/engine/core-modules/application/app-billing/dtos/charge.dto';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

// Authenticated via an APPLICATION_ACCESS token (JwtAuthStrategy sets
// request.user to the AuthContext with `application` + `workspace` when
// the token type is APPLICATION_ACCESS). Apps receive the token in their
// execution env as DEFAULT_APP_ACCESS_TOKEN, so no new auth mechanism
// is introduced here. NoPermissionGuard is used because the app token
// itself is the authorization — permissions don't apply to server-to-app
// billing events.
@Controller('app/billing')
@UseGuards(AuthGuard('jwt'))
export class AppBillingController {
  constructor(private readonly appBillingService: AppBillingService) {}

  @Post('charge')
  @UseGuards(NoPermissionGuard)
  async charge(
    @Req() request: Request,
    @Body() charge: ChargeDto,
  ): Promise<{ success: true }> {
    const authContext = request.user as AuthContext | undefined;

    // The JWT is valid (AuthGuard passed) but didn't resolve to an
    // application context — e.g. a user access token. Reject with 403:
    // the caller is authenticated, just not authorized for this endpoint.
    if (!authContext?.application || !authContext.workspace) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token. The caller must be a logic function running inside an installed application.',
      );
    }

    this.appBillingService.emitChargeEvent({
      workspaceId: authContext.workspace.id,
      applicationId: authContext.application.id,
      userWorkspaceId: authContext.userWorkspaceId,
      charge,
    });

    return { success: true };
  }
}
