import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconFolder,
  IconLink,
  IconSettings,
  useIcons,
} from 'twenty-ui/display';
import { useDebounce } from 'use-debounce';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuAddObjectMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectMenuItem';
import { CommandMenuNewSidebarItemMainMenu } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemMainMenu';
import { CommandMenuNewSidebarItemRecordSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemRecordSubView';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { useSearchQuery } from '~/generated/graphql';

type SelectedOption =
  | 'object'
  | 'record'
  | 'system'
  | 'view'
  | 'view-system'
  | null;

export const CommandMenuNewSidebarItemPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeCommandMenu } = useCommandMenu();
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [selectedObjectMetadataIdForView, setSelectedObjectMetadataIdForView] =
    useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [viewSearchInput, setViewSearchInput] = useState('');
  const [deferredRecordSearchInput] = useDebounce(recordSearchInput, 300);

  const coreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const {
    addObjectToDraft,
    addViewToDraft,
    addRecordToDraft,
    addFolderToDraft,
    addLinkToDraft,
  } = useAddToNavigationMenuDraft();
  const { workspaceNavigationMenuItems, navigationMenuItemsDraft } =
    useNavigationMenuItemsDraftState();
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const { workspaceNavigationMenuItemsObjectMetadataItems } =
    useWorkspaceNavigationMenuItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const objectMetadataItemsInWorkspaceIds = new Set(
    workspaceNavigationMenuItemsObjectMetadataItems.map((item) => item.id),
  );

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const {
    views,
    objectMetadataIdsInWorkspace,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
    viewIdsInWorkspace,
  } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const availableObjectMetadataItems = activeNonSystemObjectMetadataItems
    .filter((item) => !objectMetadataItemsInWorkspaceIds.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const activeSystemObjectMetadataItems = Object.values(objectMetadataItems)
    .filter((item) => item.isActive && item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  const availableSystemObjectMetadataItems =
    activeSystemObjectMetadataItems.filter(
      (item) =>
        !objectMetadataIdsInWorkspace.has(item.id) &&
        objectMetadataIdsWithIndexView.has(item.id),
    );

  const objectMetadataItemsWithViews = Object.values(objectMetadataItems)
    .filter(
      (item) => item.isActive && objectMetadataIdsWithAnyView.has(item.id),
    )
    .filter((item) => !item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const availableSystemObjectMetadataItemsForView =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );

  const viewsForSelectedObject = selectedObjectMetadataIdForView
    ? views
        .filter(
          (view) =>
            view.objectMetadataId === selectedObjectMetadataIdForView &&
            !viewIdsInWorkspace.has(view.id) &&
            view.key !== ViewKey.Index,
        )
        .sort((a, b) => a.position - b.position)
    : [];

  const nonReadableObjectMetadataItemsNameSingular = Object.values(
    objectMetadataItems,
  )
    .filter((objectMetadataItem) => {
      const objectPermission = getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: objectMetadataItem.id,
      });
      return !objectPermission?.canReadObjectRecords;
    })
    .map((objectMetadataItem) => objectMetadataItem.nameSingular);

  const { data: searchData, loading: recordSearchLoading } = useSearchQuery({
    client: coreClient,
    skip: selectedOption !== 'record',
    variables: {
      searchInput: deferredRecordSearchInput ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: [
        'workspaceMember',
        ...nonReadableObjectMetadataItemsNameSingular,
      ],
    },
  });

  const draftItems = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;
  const workspaceRecordIds = new Set(
    draftItems.flatMap((item) =>
      isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
    ),
  );

  const searchRecords = searchData?.search.edges.map((edge) => edge.node) ?? [];
  const availableSearchRecords = searchRecords.filter(
    (record) => !workspaceRecordIds.has(record.recordId),
  );

  const handleSelectObject = (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => {
    addObjectToDraft(objectMetadataItem, defaultViewId, currentDraft);
    closeCommandMenu();
  };

  const handleSelectRecord = (record: (typeof searchRecords)[number]) => {
    addRecordToDraft(
      {
        recordId: record.recordId,
        objectNameSingular: record.objectNameSingular,
        label: record.label,
        imageUrl: record.imageUrl,
      },
      currentDraft,
    );
    closeCommandMenu();
  };

  const handleBackToMain = () => {
    setSelectedOption(null);
    setSelectedObjectMetadataIdForView(null);
    setObjectSearchInput('');
    setRecordSearchInput('');
    setSystemObjectSearchInput('');
    setViewSearchInput('');
  };

  const handleBackToObjectList = () => {
    setSelectedOption('object');
    setSystemObjectSearchInput('');
  };

  const handleBackToViewObjectList = () => {
    const selectedObjectMetadataItem = isDefined(
      selectedObjectMetadataIdForView,
    )
      ? objectMetadataItems.find(
          (item) => item.id === selectedObjectMetadataIdForView,
        )
      : undefined;
    const cameFromSystemObjects = selectedObjectMetadataItem?.isSystem ?? false;

    setSelectedObjectMetadataIdForView(null);
    setViewSearchInput('');
    if (cameFromSystemObjects === true) {
      setSelectedOption('view-system');
    }
  };

  const handleBackToViewObjectListFromSystem = () => {
    setSelectedOption('view');
    setSystemObjectSearchInput('');
  };

  const handleSelectView = (view: View) => {
    addViewToDraft(view, currentDraft);
    closeCommandMenu();
  };

  const handleAddFolderAndOpenEdit = () => {
    const newFolderId = addFolderToDraft(t`New folder`, currentDraft);
    setSelectedNavigationMenuItemInEditMode(newFolderId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit folder`,
      pageIcon: IconFolder,
      focusTitleInput: true,
    });
  };

  const handleAddLinkAndOpenEdit = () => {
    const newLinkId = addLinkToDraft(
      t`Link label`,
      'www.example.com',
      currentDraft,
    );
    setSelectedNavigationMenuItemInEditMode(newLinkId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit link`,
      pageIcon: IconLink,
      focusTitleInput: true,
    });
  };

  if (selectedOption === 'view' && isDefined(selectedObjectMetadataIdForView)) {
    const selectedObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === selectedObjectMetadataIdForView,
    );
    const filteredViews = filterBySearchQuery({
      items: viewsForSelectedObject,
      searchQuery: viewSearchInput,
      getSearchableValues: (view) => [view.name],
    });
    const selectableItemIds = filteredViews.map((view) => view.id);
    const isEmpty = filteredViews.length === 0;
    const noResultsText =
      viewSearchInput.trim().length > 0
        ? t`No results found`
        : t`No custom views available`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={selectedObjectMetadataItem?.labelPlural ?? t`Pick a view`}
        onBack={handleBackToViewObjectList}
        searchPlaceholder={t`Search a view...`}
        searchValue={viewSearchInput}
        onSearchChange={setViewSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          <CommandGroup heading={t`Views`}>
            {filteredViews.map((view) => {
              const ViewIcon = getIcon(view.icon);
              const viewPayload: AddToNavigationDragPayload = {
                type: 'view',
                viewId: view.id,
                label: view.name,
              };
              return (
                <SelectableListItem
                  key={view.id}
                  itemId={view.id}
                  onEnter={() => handleSelectView(view)}
                >
                  <CommandMenuItemWithAddToNavigationDrag
                    Icon={ViewIcon}
                    label={view.name}
                    id={view.id}
                    onClick={() => handleSelectView(view)}
                    payload={viewPayload}
                  />
                </SelectableListItem>
              );
            })}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'view') {
    const filteredObjectMetadataItems = filterBySearchQuery({
      items: objectMetadataItemsWithViews,
      searchQuery: objectSearchInput,
      getSearchableValues: (item) => [item.labelPlural],
    });
    const isEmpty = filteredObjectMetadataItems.length === 0;
    const selectableItemIds = isEmpty
      ? ['system']
      : [...filteredObjectMetadataItems.map((item) => item.id), 'system'];
    const noResultsText =
      objectSearchInput.trim().length > 0
        ? t`No results found`
        : t`No objects with views found`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Pick an object`}
        onBack={handleBackToMain}
        searchPlaceholder={t`Search an object...`}
        searchValue={objectSearchInput}
        onSearchChange={setObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          <CommandGroup heading={t`Objects`}>
            {filteredObjectMetadataItems.map((objectMetadataItem) => (
              <CommandMenuSelectObjectForViewMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={(item) => setSelectedObjectMetadataIdForView(item.id)}
              />
            ))}
            <SelectableListItem
              itemId="system"
              onEnter={() => setSelectedOption('view-system')}
            >
              <CommandMenuItem
                Icon={IconSettings}
                label={t`System objects`}
                id="system"
                hasSubMenu={true}
                onClick={() => setSelectedOption('view-system')}
              />
            </SelectableListItem>
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'view-system') {
    const filteredSystemObjectMetadataItems = filterBySearchQuery({
      items: availableSystemObjectMetadataItemsForView,
      searchQuery: systemObjectSearchInput,
      getSearchableValues: (item) => [item.labelPlural],
    });
    const isEmpty = filteredSystemObjectMetadataItems.length === 0;
    const selectableItemIds = isEmpty
      ? []
      : filteredSystemObjectMetadataItems.map((item) => item.id);
    const noResultsText =
      systemObjectSearchInput.trim().length > 0
        ? t`No results found`
        : t`No system objects with views found`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`System objects`}
        onBack={handleBackToViewObjectListFromSystem}
        searchPlaceholder={t`Search a system object...`}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          <CommandGroup heading={t`System objects`}>
            {filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
              <CommandMenuSelectObjectForViewMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={(item) => {
                  setSelectedObjectMetadataIdForView(item.id);
                  setSelectedOption('view');
                }}
              />
            ))}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'object') {
    const filteredObjectMetadataItems = filterBySearchQuery({
      items: availableObjectMetadataItems,
      searchQuery: objectSearchInput,
      getSearchableValues: (item) => [item.labelPlural],
    });
    const isEmpty = filteredObjectMetadataItems.length === 0;
    const selectableItemIds = isEmpty
      ? ['system']
      : [...filteredObjectMetadataItems.map((item) => item.id), 'system'];
    const noResultsText =
      objectSearchInput.trim().length > 0
        ? t`No results found`
        : t`All objects are already in the sidebar`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Pick an object`}
        onBack={handleBackToMain}
        searchPlaceholder={t`Search an object...`}
        searchValue={objectSearchInput}
        onSearchChange={setObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          <CommandGroup heading={t`Objects`}>
            {filteredObjectMetadataItems.map((objectMetadataItem) => (
              <CommandMenuAddObjectMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={handleSelectObject}
              />
            ))}
            <SelectableListItem
              itemId="system"
              onEnter={() => setSelectedOption('system')}
            >
              <CommandMenuItem
                Icon={IconSettings}
                label={t`System objects`}
                id="system"
                hasSubMenu={true}
                onClick={() => setSelectedOption('system')}
              />
            </SelectableListItem>
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'system') {
    const filteredSystemObjectMetadataItems = filterBySearchQuery({
      items: availableSystemObjectMetadataItems,
      searchQuery: systemObjectSearchInput,
      getSearchableValues: (item) => [item.labelPlural],
    });
    const isEmpty = filteredSystemObjectMetadataItems.length === 0;
    const selectableItemIds = isEmpty
      ? []
      : filteredSystemObjectMetadataItems.map((item) => item.id);
    const noResultsText =
      systemObjectSearchInput.trim().length > 0
        ? t`No results found`
        : t`All system objects are already in the sidebar`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`System objects`}
        onBack={handleBackToObjectList}
        searchPlaceholder={t`Search a system object...`}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          <CommandGroup heading={t`System objects`}>
            {filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
              <CommandMenuAddObjectMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={handleSelectObject}
              />
            ))}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'record') {
    return (
      <CommandMenuNewSidebarItemRecordSubView
        availableSearchRecords={availableSearchRecords}
        recordSearchInput={recordSearchInput}
        onRecordSearchChange={setRecordSearchInput}
        recordSearchLoading={recordSearchLoading}
        deferredRecordSearchInput={deferredRecordSearchInput}
        objectMetadataItems={objectMetadataItems}
        onSelectRecord={handleSelectRecord}
        onBack={handleBackToMain}
      />
    );
  }

  return (
    <CommandMenuNewSidebarItemMainMenu
      onSelectObject={() => setSelectedOption('object')}
      onSelectView={() => setSelectedOption('view')}
      onSelectRecord={() => setSelectedOption('record')}
      onAddFolder={handleAddFolderAndOpenEdit}
      onAddLink={handleAddLinkAndOpenEdit}
    />
  );
};
