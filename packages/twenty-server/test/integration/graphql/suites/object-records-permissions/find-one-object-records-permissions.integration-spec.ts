import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('findOneObjectRecordsPermissions', () => {
  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { eq: '777a8457-eb2d-40ac-a707-551b615b6980' } },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ person: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should read an object record when user has permission (admin role)', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { city: { eq: 'Seattle' } },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.person).toBeDefined();
    expect(response.body.data.person.city).toBe('Seattle');
  });

  it('should read an object record when executed by api key', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { city: { eq: 'Seattle' } },
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.person).toBeDefined();
    expect(response.body.data.person.city).toBe('Seattle');
  });
});
