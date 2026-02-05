import { randomUUID } from 'node:crypto';

import { default as request } from 'supertest';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const TEST_COMPANY_ACME_CORP_ID = randomUUID();
const TEST_COMPANY_BETA_INC_ID = randomUUID();
const TEST_COMPANY_ACME_LABS_ID = randomUUID();

describe('RLS predicate enforcement', () => {
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let createdRoleId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    // Enable RLS feature flag
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
      value: true,
      expectToFail: false,
    });

    // Get object metadata for company
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    jestExpectToBeDefined(companyObjectMetadata.fieldsList);
    const nameField = companyObjectMetadata.fieldsList.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField.id;

    // Get original member role ID
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

    // Create a test role with canReadAllObjectRecords: true
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS Test Role',
        description: 'A role for RLS predicate enforcement testing',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    createdRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(createdRoleId);

    // Create RLS predicate: company.name CONTAINS "Acme"
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Acme',
          },
        ],
        predicateGroups: [],
      },
    });

    // Create test companies
    const createCompaniesOperation = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      data: [
        { id: TEST_COMPANY_ACME_CORP_ID, name: 'Acme Corp' },
        { id: TEST_COMPANY_BETA_INC_ID, name: 'Beta Inc' },
        { id: TEST_COMPANY_ACME_LABS_ID, name: 'Acme Labs' },
      ],
    });

    await makeGraphqlAPIRequest(createCompaniesOperation);

    // Assign the RLS test role to Jony (member)
    await updateWorkspaceMemberRole({
      client,
      roleId: createdRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterAll(async () => {
    // Restore original member role
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

    // Delete test companies
    await deleteRecordsByIds('company', [
      TEST_COMPANY_ACME_CORP_ID,
      TEST_COMPANY_BETA_INC_ID,
      TEST_COMPANY_ACME_LABS_ID,
    ]);

    // Delete the test role
    if (createdRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }

    // Disable RLS feature flag
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  describe('findMany with RLS', () => {
    it('should only return companies matching RLS predicate for restricted user', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        filter: {
          id: {
            in: [
              TEST_COMPANY_ACME_CORP_ID,
              TEST_COMPANY_BETA_INC_ID,
              TEST_COMPANY_ACME_LABS_ID,
            ],
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.companies).toBeDefined();
      expect(response.body.data.companies.edges).toBeDefined();

      const companyNames = response.body.data.companies.edges.map(
        (edge: { node: { name: string } }) => edge.node.name,
      );

      // Should only see companies with "Acme" in the name
      expect(companyNames).toContain('Acme Corp');
      expect(companyNames).toContain('Acme Labs');
      expect(companyNames).not.toContain('Beta Inc');
    });

    it('should return all companies for admin user', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        filter: {
          id: {
            in: [
              TEST_COMPANY_ACME_CORP_ID,
              TEST_COMPANY_BETA_INC_ID,
              TEST_COMPANY_ACME_LABS_ID,
            ],
          },
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.companies).toBeDefined();

      const companyNames = response.body.data.companies.edges.map(
        (edge: { node: { name: string } }) => edge.node.name,
      );

      // Admin should see all companies
      expect(companyNames).toContain('Acme Corp');
      expect(companyNames).toContain('Acme Labs');
      expect(companyNames).toContain('Beta Inc');
    });
  });

  describe('findOne with RLS', () => {
    it('should return null for company not matching RLS predicate', async () => {
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        filter: { id: { eq: TEST_COMPANY_BETA_INC_ID } },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.company).toBeNull();
    });

    it('should return company matching RLS predicate', async () => {
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        filter: { id: { eq: TEST_COMPANY_ACME_CORP_ID } },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.company).toBeDefined();
      expect(response.body.data.company.name).toBe('Acme Corp');
    });

    it('should return any company for admin user', async () => {
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        filter: { id: { eq: TEST_COMPANY_BETA_INC_ID } },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.company).toBeDefined();
      expect(response.body.data.company.name).toBe('Beta Inc');
    });
  });

  describe('search with RLS', () => {
    it('should only return companies matching RLS predicate in search results', async () => {
      const graphqlOperation = searchFactory({
        searchInput: 'Corp Labs Inc',
        includedObjectNameSingulars: ['company'],
        limit: 50,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();

      const companyLabels = response.body.data.search.edges
        .filter(
          (edge: { node: { objectNameSingular: string } }) =>
            edge.node.objectNameSingular === 'company',
        )
        .map((edge: { node: { label: string } }) => edge.node.label);

      // Check that "Beta Inc" is not in the results
      const hasBetaInc = companyLabels.some((label: string) =>
        label.includes('Beta'),
      );

      expect(hasBetaInc).toBe(false);
    });

    it('should return all matching companies for admin user', async () => {
      const graphqlOperation = searchFactory({
        searchInput: 'Corp Labs Inc',
        includedObjectNameSingulars: ['company'],
        limit: 50,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.search).toBeDefined();
      expect(response.body.data.search.edges).toBeDefined();
    });
  });

  describe('updateOne with RLS', () => {
    it('should fail to update company not matching RLS predicate', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        recordId: TEST_COMPANY_BETA_INC_ID,
        data: { name: 'Beta Inc Updated' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      // Should either fail with error or return null
      const hasError = response.body.errors !== undefined;
      const isNull = response.body.data?.updateCompany === null;

      expect(hasError || isNull).toBe(true);
    });

    it('should successfully update company matching RLS predicate', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        recordId: TEST_COMPANY_ACME_CORP_ID,
        data: { name: 'Acme Corp Updated' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateCompany).toBeDefined();
      expect(response.body.data.updateCompany.name).toBe('Acme Corp Updated');

      // Restore original name
      const restoreOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        recordId: TEST_COMPANY_ACME_CORP_ID,
        data: { name: 'Acme Corp' },
      });

      await makeGraphqlAPIRequest(restoreOperation);
    });
  });

  describe('deleteOne with RLS', () => {
    it('should fail to delete company not matching RLS predicate', async () => {
      const graphqlOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id deletedAt',
        recordId: TEST_COMPANY_BETA_INC_ID,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      // Should either fail with error or return null
      const hasError = response.body.errors !== undefined;
      const isNull = response.body.data?.deleteCompany === null;

      expect(hasError || isNull).toBe(true);
    });

    it('should successfully delete company matching RLS predicate and then restore it', async () => {
      // First, delete the company
      const deleteOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id deletedAt',
        recordId: TEST_COMPANY_ACME_LABS_ID,
      });

      const deleteResponse =
        await makeGraphqlAPIRequestWithMemberRole(deleteOperation);

      expect(deleteResponse.body.data).toBeDefined();
      expect(deleteResponse.body.data.deleteCompany).toBeDefined();
      expect(deleteResponse.body.data.deleteCompany.deletedAt).not.toBeNull();

      // Restore the company using admin for cleanup
      const restoreOperation = {
        query: `
          mutation RestoreCompany($id: UUID!) {
            restoreCompany(id: $id) {
              id
              deletedAt
            }
          }
        `,
        variables: {
          id: TEST_COMPANY_ACME_LABS_ID,
        },
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(restoreOperation);
    });
  });
});
