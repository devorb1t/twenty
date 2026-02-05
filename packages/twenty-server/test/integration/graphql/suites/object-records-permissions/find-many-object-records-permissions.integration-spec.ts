import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('findManyObjectRecordsPermissions', () => {
  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      first: 10,
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ people: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should read object records when user has permission (admin role)', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      first: 10,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.people).toBeDefined();
    expect(response.body.data.people.edges).toBeDefined();
    expect(Array.isArray(response.body.data.people.edges)).toBe(true);
  });

  it('should read object records when executed by api key', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      first: 10,
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.people).toBeDefined();
    expect(response.body.data.people.edges).toBeDefined();
    expect(Array.isArray(response.body.data.people.edges)).toBe(true);
  });
});
