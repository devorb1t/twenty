import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalDavClientProvider {
  public getCalDavCalendarClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
  ): CalDAVClient {
    if (
      !connectedAccount.connectionParameters?.CALDAV?.password ||
      !connectedAccount.connectionParameters?.CALDAV?.host ||
      !isDefined(connectedAccount.handle)
    ) {
      throw new Error('Missing required CalDAV connection parameters');
    }

    return new CalDAVClient({
      username:
        connectedAccount.connectionParameters.CALDAV.username ??
        connectedAccount.handle,
      password: connectedAccount.connectionParameters.CALDAV.password,
      serverUrl: connectedAccount.connectionParameters.CALDAV.host,
    });
  }
}
