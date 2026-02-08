import { Avatar } from 'twenty-ui/display';

import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type CommandMenuNewSidebarItemRecordItemProps = {
  record: SearchRecord;
};

export const CommandMenuNewSidebarItemRecordItem = ({
  record,
}: CommandMenuNewSidebarItemRecordItemProps) => {
  const { closeCommandMenu } = useCommandMenu();
  const { addRecordToDraft } = useAddToNavigationMenuDraft();
  const { currentDraft } = useNavigationMenuItemEditFolderData();
  const { objectMetadataItems } = useObjectMetadataItems();
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

  const handleSelectRecord = () => {
    addRecordToDraft(
      {
        recordId: record.recordId,
        objectNameSingular: record.objectNameSingular,
        label: record.label,
        imageUrl: record.imageUrl,
      },
      currentDraft ?? [],
    );
    closeCommandMenu();
  };

  return (
    <SelectableListItem itemId={record.recordId} onEnter={handleSelectRecord}>
      <CommandMenuItemWithAddToNavigationDrag
        icon={
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
        }
        label={record.label}
        description={
          objectMetadataItem?.labelSingular ?? record.objectNameSingular
        }
        id={record.recordId}
        onClick={handleSelectRecord}
        payload={recordPayload}
      />
    </SelectableListItem>
  );
};
