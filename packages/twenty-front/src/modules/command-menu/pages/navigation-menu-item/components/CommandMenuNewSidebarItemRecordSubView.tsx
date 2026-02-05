import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SearchRecordBase = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type CommandMenuNewSidebarItemRecordSubViewProps<T extends SearchRecordBase> = {
  availableSearchRecords: T[];
  recordSearchInput: string;
  onRecordSearchChange: (value: string) => void;
  recordSearchLoading: boolean;
  deferredRecordSearchInput: string;
  objectMetadataItems: ObjectMetadataItem[];
  onSelectRecord: (record: T) => void;
  onBack: () => void;
};

export const CommandMenuNewSidebarItemRecordSubView = <
  T extends SearchRecordBase,
>({
  availableSearchRecords,
  recordSearchInput,
  onRecordSearchChange,
  recordSearchLoading,
  deferredRecordSearchInput,
  objectMetadataItems,
  onSelectRecord,
  onBack,
}: CommandMenuNewSidebarItemRecordSubViewProps<T>) => {
  const { t } = useLingui();
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
      onSearchChange={onRecordSearchChange}
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
            return (
              <SelectableListItem
                key={record.recordId}
                itemId={record.recordId}
                onEnter={() => onSelectRecord(record)}
              >
                <CommandMenuItemWithAddToNavigationDrag
                  icon={recordIcon}
                  label={record.label}
                  description={
                    objectMetadataItem?.labelSingular ??
                    record.objectNameSingular
                  }
                  id={record.recordId}
                  onClick={() => onSelectRecord(record)}
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
