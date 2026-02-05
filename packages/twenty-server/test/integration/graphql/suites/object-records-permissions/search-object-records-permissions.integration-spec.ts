import { default as request } from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchObjectRecordsPermissions', () => {
  describe('basic permission tests', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = searchFactory({
        searchInput: 'test',
        limit: 10,
      });

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ search: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should return search results when user has permission (admin role)', async () => {
      const graphqlOperation = searchFactory({
        searchInput: 'Seattle',
        limit: 10,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toBeDefined();
      expect(Array.isArray(response.body.data.search.edges)).toBe(true);
    });

    it('should return search results when executed by api key', async () => {
      const graphqlOperation = searchFactory({
        searchInput: 'Seattle',
        limit: 10,
      });

      const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toBeDefined();
      expect(Array.isArray(response.body.data.search.edges)).toBe(true);
    });
  });

  describe('granular object permissions for search', () => {
    let originalMemberRoleId: string;
    let customRoleId: string;

    beforeAll(async () => {
      const getRolesQuery = {
        query: `
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
      };

      const rolesResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRolesQuery);

      originalMemberRoleId = rolesResponse.body.data.getRoles.find(
        (role: { label: string }) => role.label === 'Member',
      ).id;
    });

    afterAll(async () => {
      const restoreMemberRoleQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
            updateWorkspaceMemberRole(
              workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY}"
              roleId: "${originalMemberRoleId}"
            ) {
              id
            }
          }
        `,
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(restoreMemberRoleQuery);
    });

    afterEach(async () => {
      if (customRoleId) {
        await deleteRole(client, customRoleId);
      }
    });

    it('should only return person results when user can read person but not company', async () => {
      const { roleId } = await createCustomRoleWithObjectPermissions({
        label: 'PersonOnlySearchRole',
        canReadPerson: true,
        canReadCompany: false,
        hasAllObjectRecordsReadPermission: false,
      });

      customRoleId = roleId;

      await updateWorkspaceMemberRole({
        client,
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const graphqlOperation = searchFactory({
        searchInput: 'Seattle',
        limit: 50,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toBeDefined();

      const edges = response.body.data.search.edges;

      edges.forEach((edge: { node: { objectNameSingular: string } }) => {
        expect(edge.node.objectNameSingular).not.toBe('company');
      });
    });

    it('should only return company results when user can read company but not person', async () => {
      const { roleId } = await createCustomRoleWithObjectPermissions({
        label: 'CompanyOnlySearchRole',
        canReadPerson: false,
        canReadCompany: true,
        hasAllObjectRecordsReadPermission: false,
      });

      customRoleId = roleId;

      await updateWorkspaceMemberRole({
        client,
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const graphqlOperation = searchFactory({
        searchInput: 'Airbnb',
        includedObjectNameSingulars: ['company', 'person'],
        limit: 50,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toBeDefined();

      const edges = response.body.data.search.edges;

      edges.forEach((edge: { node: { objectNameSingular: string } }) => {
        expect(edge.node.objectNameSingular).not.toBe('person');
      });
    });

    it('should return empty results when user cannot read any searchable objects', async () => {
      const { roleId } = await createCustomRoleWithObjectPermissions({
        label: 'NoReadSearchRole',
        canReadPerson: false,
        canReadCompany: false,
        hasAllObjectRecordsReadPermission: false,
      });

      customRoleId = roleId;

      await updateWorkspaceMemberRole({
        client,
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const graphqlOperation = searchFactory({
        searchInput: 'Seattle',
        includedObjectNameSingulars: ['company', 'person'],
        limit: 50,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toHaveLength(0);
    });
  });
});
