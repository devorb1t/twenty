import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  IconAddressBook,
  IconCube,
  IconFolder,
  IconLink,
  IconList,
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
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useSearchQuery } from '~/generated/graphql';

type SelectedOption =
  | 'object'
  | 'record'
  | 'system'
  | 'view'
  | 'view-system'
  | null;

const CommandMenuAddObjectMenuItem = ({
  objectMetadataItem,
  onSelect,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
}) => {
  const { getIcon } = useIcons();
  const defaultViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const isDisabled = !isDefined(defaultViewId);

  const handleClick = () => {
    if (!isDisabled && isDefined(defaultViewId)) {
      onSelect(objectMetadataItem, defaultViewId);
    }
  };

  const objectPayload: AddToNavigationDragPayload = {
    type: 'object',
    objectMetadataId: objectMetadataItem.id,
    defaultViewId: defaultViewId ?? '',
    label: objectMetadataItem.labelPlural,
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      {isDisabled ? (
        <CommandMenuItem
          Icon={Icon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          disabled={true}
        />
      ) : (
        <CommandMenuItemWithAddToNavigationDrag
          Icon={Icon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          payload={objectPayload}
        />
      )}
    </SelectableListItem>
  );
};

const CommandMenuSelectObjectForViewMenuItem = ({
  objectMetadataItem,
  onSelect,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (objectMetadataItem: ObjectMetadataItem) => void;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  const handleClick = () => {
    onSelect(objectMetadataItem);
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      <CommandMenuItem
        Icon={Icon}
        label={objectMetadataItem.labelPlural}
        id={objectMetadataItem.id}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};

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
  const coreViews = useRecoilValue(coreViewsState);
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

  const objectMetadataIdsInWorkspace = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    const ids = new Set<string>();
    for (const item of currentDraft) {
      if (isDefined(item.viewId)) {
        const view = views.find((view) => view.id === item.viewId);
        if (isDefined(view)) {
          ids.add(view.objectMetadataId);
        }
      }
      if (isDefined(item.targetObjectMetadataId)) {
        ids.add(item.targetObjectMetadataId);
      }
    }
    return ids;
  }, [coreViews, currentDraft]);

  const availableObjectMetadataItems = activeNonSystemObjectMetadataItems
    .filter((item) => !objectMetadataItemsInWorkspaceIds.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const objectMetadataIdsWithIndexView = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    return new Set(
      views
        .filter((view) => view.key === ViewKey.Index)
        .map((view) => view.objectMetadataId),
    );
  }, [coreViews]);

  const activeSystemObjectMetadataItems = useMemo(
    () =>
      Object.values(objectMetadataItems)
        .filter((item) => item.isActive && item.isSystem)
        .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural)),
    [objectMetadataItems],
  );
  const availableSystemObjectMetadataItems =
    activeSystemObjectMetadataItems.filter(
      (item) =>
        !objectMetadataIdsInWorkspace.has(item.id) &&
        objectMetadataIdsWithIndexView.has(item.id),
    );

  const objectMetadataIdsWithAnyView = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    return new Set(views.map((view) => view.objectMetadataId));
  }, [coreViews]);

  const viewIdsInWorkspace = useMemo(() => {
    const items = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;
    return new Set(
      items
        .filter((item) => isDefined(item.viewId))
        .map((item) => item.viewId as string),
    );
  }, [navigationMenuItemsDraft, workspaceNavigationMenuItems]);

  const objectMetadataItemsWithViews = useMemo(() => {
    const objects = Object.values(objectMetadataItems).filter(
      (item) => item.isActive && objectMetadataIdsWithAnyView.has(item.id),
    );
    return objects
      .filter((item) => !item.isSystem)
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  }, [objectMetadataItems, objectMetadataIdsWithAnyView]);

  const availableSystemObjectMetadataItemsForView =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );

  const viewsForSelectedObject = useMemo(() => {
    if (!selectedObjectMetadataIdForView) return [];
    const views = coreViews.map(convertCoreViewToView);
    return views
      .filter(
        (view) =>
          view.objectMetadataId === selectedObjectMetadataIdForView &&
          !viewIdsInWorkspace.has(view.id) &&
          view.key !== ViewKey.Index,
      )
      .sort((a, b) => a.position - b.position);
  }, [coreViews, selectedObjectMetadataIdForView, viewIdsInWorkspace]);

  const nonReadableObjectMetadataItemsNameSingular = useMemo(() => {
    return Object.values(objectMetadataItems)
      .filter((objectMetadataItem) => {
        const objectPermission = getObjectPermissionsFromMapByObjectMetadataId({
          objectPermissionsByObjectMetadataId,
          objectMetadataId: objectMetadataItem.id,
        });
        return !objectPermission?.canReadObjectRecords;
      })
      .map((objectMetadataItem) => objectMetadataItem.nameSingular);
  }, [objectMetadataItems, objectPermissionsByObjectMetadataId]);

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

  const workspaceRecordIds = useMemo(() => {
    const items = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;
    return new Set(
      items
        .filter((item) => isDefined(item.targetRecordId))
        .map((item) => item.targetRecordId as string),
    );
  }, [navigationMenuItemsDraft, workspaceNavigationMenuItems]);

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
    const filteredViews = viewsForSelectedObject.filter((view) =>
      view.name.toLowerCase().includes(viewSearchInput.toLowerCase().trim()),
    );
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
    const filteredObjectMetadataItems = objectMetadataItemsWithViews.filter(
      (item) =>
        item.labelPlural
          .toLowerCase()
          .includes(objectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredObjectMetadataItems.length > 0
        ? [...filteredObjectMetadataItems.map((item) => item.id), 'system']
        : ['empty', 'system'];

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
        >
          <CommandGroup heading={t`Objects`}>
            {filteredObjectMetadataItems.length === 0 ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    objectSearchInput.trim().length > 0
                      ? t`No results found`
                      : t`No objects with views found`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              filteredObjectMetadataItems.map((objectMetadataItem) => (
                <CommandMenuSelectObjectForViewMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={(item) =>
                    setSelectedObjectMetadataIdForView(item.id)
                  }
                />
              ))
            )}
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
    const filteredSystemObjectMetadataItems =
      availableSystemObjectMetadataItemsForView.filter((item) =>
        item.labelPlural
          .toLowerCase()
          .includes(systemObjectSearchInput.toLowerCase().trim()),
      );
    const selectableItemIds =
      filteredSystemObjectMetadataItems.length > 0
        ? filteredSystemObjectMetadataItems.map((item) => item.id)
        : ['empty'];

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
        >
          <CommandGroup heading={t`System objects`}>
            {filteredSystemObjectMetadataItems.length === 0 ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    systemObjectSearchInput.trim().length > 0
                      ? t`No results found`
                      : t`No system objects with views found`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
                <CommandMenuSelectObjectForViewMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={(item) => {
                    setSelectedObjectMetadataIdForView(item.id);
                    setSelectedOption('view');
                  }}
                />
              ))
            )}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'object') {
    const filteredObjectMetadataItems = availableObjectMetadataItems.filter(
      (item) =>
        item.labelPlural
          .toLowerCase()
          .includes(objectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredObjectMetadataItems.length > 0
        ? [...filteredObjectMetadataItems.map((item) => item.id), 'system']
        : ['empty', 'system'];

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
        >
          <CommandGroup heading={t`Objects`}>
            {filteredObjectMetadataItems.length === 0 ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    objectSearchInput.trim().length > 0
                      ? t`No results found`
                      : t`All objects are already in the sidebar`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              filteredObjectMetadataItems.map((objectMetadataItem) => (
                <CommandMenuAddObjectMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleSelectObject}
                />
              ))
            )}
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
    const filteredSystemObjectMetadataItems =
      availableSystemObjectMetadataItems.filter((item) =>
        item.labelPlural
          .toLowerCase()
          .includes(systemObjectSearchInput.toLowerCase().trim()),
      );
    const selectableItemIds =
      filteredSystemObjectMetadataItems.length > 0
        ? filteredSystemObjectMetadataItems.map((item) => item.id)
        : ['empty'];

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
        >
          <CommandGroup heading={t`System objects`}>
            {filteredSystemObjectMetadataItems.length === 0 ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    systemObjectSearchInput.trim().length > 0
                      ? t`No results found`
                      : t`All system objects are already in the sidebar`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
                <CommandMenuAddObjectMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleSelectObject}
                />
              ))
            )}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (selectedOption === 'record') {
    const selectableItemIds =
      availableSearchRecords.length > 0
        ? availableSearchRecords.map((record) => record.recordId)
        : ['empty'];

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Add a record`}
        onBack={handleBackToMain}
        searchPlaceholder={t`Search records...`}
        searchValue={recordSearchInput}
        onSearchChange={setRecordSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          loading={recordSearchLoading}
          noResults={
            !recordSearchLoading &&
            deferredRecordSearchInput.length > 0 &&
            !searchRecords.length
          }
        >
          <CommandGroup heading={t`Results`}>
            {availableSearchRecords.length === 0 && !recordSearchLoading ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    deferredRecordSearchInput.length > 0
                      ? t`No results found`
                      : t`Type to search records`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              availableSearchRecords.map((record) => {
                const objectMetadataItem = objectMetadataItems.find(
                  (item) => item.nameSingular === record.objectNameSingular,
                );
                const recordPayload: AddToNavigationDragPayload = {
                  type: 'record',
                  recordId: record.recordId,
                  objectMetadataId: objectMetadataItem?.id ?? '',
                  objectNameSingular: record.objectNameSingular,
                  label: record.label,
                  imageUrl: record.imageUrl,
                };
                const recordIcon = (
                  <Avatar
                    type={
                      record.objectNameSingular ===
                      CoreObjectNameSingular.Company
                        ? 'squared'
                        : 'rounded'
                    }
                    avatarUrl={record.imageUrl}
                    placeholderColorSeed={record.recordId}
                    placeholder={record.label}
                  />
                );
                return (
                  <SelectableListItem
                    key={record.recordId}
                    itemId={record.recordId}
                    onEnter={() => handleSelectRecord(record)}
                  >
                    <CommandMenuItemWithAddToNavigationDrag
                      icon={recordIcon}
                      label={record.label}
                      description={
                        objectMetadataItem?.labelSingular ??
                        record.objectNameSingular
                      }
                      id={record.recordId}
                      onClick={() => handleSelectRecord(record)}
                      payload={recordPayload}
                    />
                  </SelectableListItem>
                );
              })
            )}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={['object', 'view', 'record', 'folder', 'link']}
    >
      <CommandGroup heading={t`Data`}>
        <SelectableListItem
          itemId="object"
          onEnter={() => setSelectedOption('object')}
        >
          <CommandMenuItem
            Icon={IconCube}
            label={t`Object`}
            id="object"
            hasSubMenu={true}
            onClick={() => setSelectedOption('object')}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="view"
          onEnter={() => setSelectedOption('view')}
        >
          <CommandMenuItem
            Icon={IconList}
            label={t`View`}
            id="view"
            hasSubMenu={true}
            onClick={() => setSelectedOption('view')}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="record"
          onEnter={() => setSelectedOption('record')}
        >
          <CommandMenuItem
            Icon={IconAddressBook}
            label={t`Record`}
            id="record"
            hasSubMenu={true}
            onClick={() => setSelectedOption('record')}
          />
        </SelectableListItem>
      </CommandGroup>
      <CommandGroup heading={t`Other`}>
        <SelectableListItem
          itemId="folder"
          onEnter={handleAddFolderAndOpenEdit}
        >
          <CommandMenuItemWithAddToNavigationDrag
            Icon={IconFolder}
            label={t`Folder`}
            id="folder"
            onClick={handleAddFolderAndOpenEdit}
            payload={{
              type: 'folder',
              folderId: 'new',
              name: t`New folder`,
            }}
          />
        </SelectableListItem>
        <SelectableListItem itemId="link" onEnter={handleAddLinkAndOpenEdit}>
          <CommandMenuItemWithAddToNavigationDrag
            Icon={IconLink}
            label={t`Link`}
            id="link"
            onClick={handleAddLinkAndOpenEdit}
            payload={{
              type: 'link',
              linkId: 'new',
              name: t`Link label`,
              link: 'https://www.example.com',
            }}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
