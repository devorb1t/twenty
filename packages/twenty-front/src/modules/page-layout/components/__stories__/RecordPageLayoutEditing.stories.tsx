import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { RecordShowPage } from '~/pages/object-record/RecordShowPage';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedUserData } from '~/testing/mock-data/users';
import { getOperationName } from '~/utils/getOperationName';

const companyRecord = mockedCompanyRecords[0];

const mockedUserDataWithFeatureFlags = {
  ...mockedUserData,
  currentWorkspace: {
    ...mockedUserData.currentWorkspace,
    featureFlags: [
      {
        __typename: 'FeatureFlag' as const,
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
        value: true,
      },
      {
        __typename: 'FeatureFlag' as const,
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
        value: true,
      },
    ],
  },
};

const enterEditMode = async (canvasElement: HTMLElement) => {
  const body = canvasElement.ownerDocument.body;

  const sidePanelButton = await within(body).findByTestId(
    'page-header-side-panel-button',
  );
  await userEvent.click(sidePanelButton);

  const searchInput = await within(body).findByTestId('side-panel-focus');
  await userEvent.type(searchInput, 'Edit Layout');

  const editLayoutItem = await within(body).findByText('Edit Layout', {
    exact: true,
  });
  await userEvent.click(editLayoutItem);

  await waitFor(
    () => {
      expect(within(body).getByText('Layout customization')).toBeVisible();
    },
    { timeout: 5000 },
  );
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Modules/PageLayout/RecordPageLayoutEditing',
  component: RecordShowPage,
  decorators: [PageDecorator, ContextStoreDecorator, RecordStoreDecorator],
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'company',
      ':objectRecordId': companyRecord.id,
    },
  },
  parameters: {
    records: [companyRecord],
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedUserDataWithFeatureFlags,
            },
          });
        }),
        graphql.query('FindOneCompany', () => {
          return HttpResponse.json({
            data: {
              company: companyRecord,
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLayout: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await expect(await within(body).findByText('Fields')).toBeVisible();

    await expect(
      await within(
        await within(body).findByTestId('page-layout-tab-list'),
      ).findByText('Timeline'),
    ).toBeVisible();
  },
};

export const CreateTab: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const newTabButton = await within(body).findByRole('button', {
      name: 'New Tab',
    });
    await userEvent.click(newTabButton);

    const emptyTabInput = await within(body).findByPlaceholderText('Tab');
    await expect(emptyTabInput).toHaveValue('Untitled');
    await userEvent.keyboard('{Escape}');

    const moreButtons = await within(
      within(body).getByTestId('page-layout-tab-list'),
    ).findAllByRole('button', {
      name: /\+\d{1} More/,
    });
    await expect(moreButtons[1]).toBeVisible();

    await userEvent.click(moreButtons[1]);

    await waitFor(() => {
      expect(
        within(within(body).getAllByRole('listbox')[0]).getByText('Untitled', {
          exact: true,
        }),
      ).toBeVisible();
    });
  },
};

export const RenameTab: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const timelineTab = await within(
      within(body).getByTestId('page-layout-tab-list'),
    ).findByText('Timeline', {
      exact: true,
    });
    await userEvent.click(timelineTab);

    const sidePanel = await waitFor(() => {
      return canvasElement.querySelector('[data-side-panel]') as HTMLElement;
    });

    await userEvent.click(await within(sidePanel!).findByText('Timeline'));

    const titleInput =
      await within(body).findByPlaceholderText('Full tab widget');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'My Custom Timeline{Enter}');

    await waitFor(() => {
      expect(
        within(within(body).getByTestId('page-layout-tab-list')).getByText(
          'My Custom Timeline',
          { exact: true },
        ),
      ).toBeVisible();
    });
  },
};

// TODO
export const DeleteTab: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const defaultMoreTabsCount = 5;

    await waitFor(
      () => {
        expect(
          within(body).getByText(`+${defaultMoreTabsCount} More`, {
            exact: true,
          }),
        ).toBeVisible();
      },
      { timeout: 5000 },
    );

    const newTabButton = await within(body).findByRole('button', {
      name: 'New Tab',
    });
    await userEvent.click(newTabButton);

    const emptyTabInput = await within(body).findByRole('textbox', {
      name: 'Tab',
    });
    await expect(emptyTabInput).toHaveValue('Untitled');

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        within(body).getByText(`+${defaultMoreTabsCount + 1} More`, {
          exact: true,
        }),
      ).toBeVisible();
    });

    const deleteButton = await within(body).findByText('Delete', {
      exact: true,
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        within(body).getByText(`+${defaultMoreTabsCount} More`, {
          exact: true,
        }),
      ).toBeVisible();
    });
  },
};

// TODO
export const DuplicateTab: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const timelineTab = await within(body).findByText('Timeline', {
      exact: true,
    });
    await userEvent.click(timelineTab);
    await userEvent.click(timelineTab);

    const duplicateButton = await within(body).findByText('Duplicate', {
      exact: true,
    });
    await userEvent.click(duplicateButton);

    await waitFor(() => {
      expect(
        within(body).getByText('Timeline - Copy', { exact: true }),
      ).toBeVisible();
    });
  },
};

// TODO
export const ReorderTabMoveLeft: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const tasksTab = await within(body).findByText('Tasks', { exact: true });
    await userEvent.click(tasksTab);
    await userEvent.click(tasksTab);

    const moveLeftButton = await within(body).findByText('Move left', {
      exact: true,
    });
    await userEvent.click(moveLeftButton);

    await waitFor(() => {
      expect(within(body).getByText('Tasks', { exact: true })).toBeVisible();
      expect(within(body).getByText('Timeline', { exact: true })).toBeVisible();
    });
  },
};

// TODO
export const TabSwitching: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    const emailsTab = await within(body).findByText('Emails', {
      exact: true,
    });
    await userEvent.click(emailsTab);

    const tasksTab = await within(body).findByText('Tasks', { exact: true });
    await userEvent.click(tasksTab);

    const timelineTab = await within(body).findByText('Timeline', {
      exact: true,
    });
    await userEvent.click(timelineTab);
  },
};

// TODO
export const CancelDiscardsChanges: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;

    await enterEditMode(canvasElement);

    const newTabButton = await within(body).findByRole('button', {
      name: 'New Tab',
    });
    await userEvent.click(newTabButton);

    const emptyTabInput = await within(body).findByRole('textbox', {
      name: 'Tab',
    });
    await expect(emptyTabInput).toHaveValue('Untitled');

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(within(body).getByText('Untitled', { exact: true })).toBeVisible();
    });

    const cancelButton = await within(body).findByRole('button', {
      name: 'Cancel',
    });
    await userEvent.click(cancelButton);

    await waitFor(
      () => {
        expect(
          within(body).queryByText('Untitled', { exact: true }),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  },
};
