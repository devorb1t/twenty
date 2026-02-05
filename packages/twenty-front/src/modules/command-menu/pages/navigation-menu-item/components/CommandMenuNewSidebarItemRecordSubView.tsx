import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { useDebounce } from 'use-debounce';

import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';
import { useSearchQuery } from '~/generated/graphql';

type SearchRecordBase = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type CommandMenuNewSidebarItemRecordSubViewProps = {
  currentDraft: NavigationMenuItem[];
  objectMetadataItems: ObjectMetadataItem[];
  onBack: () => void;
  onSuccess: () => void;
};

export const CommandMenuNewSidebarItemRecordSubView = ({
  currentDraft,
  objectMetadataItems,
  onBack,
  onSuccess,
}: CommandMenuNewSidebarItemRecordSubViewProps) => {
  const { addRecordToDraft } = useAddToNavigationMenuDraft();
  const { t } = useLingui();
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [deferredRecordSearchInput] = useDebounce(recordSearchInput, 300);
  const coreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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
    variables: {
      searchInput: deferredRecordSearchInput ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: [
        'workspaceMember',
        ...nonReadableObjectMetadataItemsNameSingular,
      ],
    },
  });

  const workspaceRecordIds = new Set(
    currentDraft.flatMap((item) =>
      isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
    ),
  );

  const searchRecords = searchData?.search.edges.map((edge) => edge.node) ?? [];
  const availableSearchRecords = searchRecords.filter(
    (record) => !workspaceRecordIds.has(record.recordId),
  ) as SearchRecordBase[];

  const isEmpty = availableSearchRecords.length === 0 && !recordSearchLoading;
  const selectableItemIds = isEmpty
    ? []
    : availableSearchRecords.map((record) => record.recordId);
  const noResultsText =
    deferredRecordSearchInput.length > 0
      ? t`No results found`
      : t`Type to search records`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Add a record`}
      onBack={onBack}
      searchPlaceholder={t`Search records...`}
      searchValue={recordSearchInput}
      onSearchChange={setRecordSearchInput}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        loading={recordSearchLoading}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Results`}>
          {availableSearchRecords.map((record) => {
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
                  record.objectNameSingular === CoreObjectNameSingular.Company
                    ? 'squared'
                    : 'rounded'
                }
                avatarUrl={record.imageUrl}
                placeholderColorSeed={record.recordId}
                placeholder={record.label}
              />
            );
            const handleSelectRecord = () => {
              addRecordToDraft(
                {
                  recordId: record.recordId,
                  objectNameSingular: record.objectNameSingular,
                  label: record.label,
                  imageUrl: record.imageUrl,
                },
                currentDraft,
              );
              onSuccess();
            };

            return (
              <SelectableListItem
                key={record.recordId}
                itemId={record.recordId}
                onEnter={handleSelectRecord}
              >
                <CommandMenuItemWithAddToNavigationDrag
                  icon={recordIcon}
                  label={record.label}
                  description={
                    objectMetadataItem?.labelSingular ??
                    record.objectNameSingular
                  }
                  id={record.recordId}
                  onClick={handleSelectRecord}
                  payload={recordPayload}
                />
              </SelectableListItem>
            );
          })}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
