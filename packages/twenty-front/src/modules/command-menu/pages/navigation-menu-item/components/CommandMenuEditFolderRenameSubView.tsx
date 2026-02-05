import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';

type CommandMenuEditFolderRenameSubViewProps = {
  folderId: string;
  onBack: () => void;
  onSuccess: () => void;
};

export const CommandMenuEditFolderRenameSubView = ({
  folderId,
  onBack,
  onSuccess,
}: CommandMenuEditFolderRenameSubViewProps) => {
  const { t } = useLingui();
  const [folderRenameInput, setFolderRenameInput] = useState('');
  const { updateFolderNameInDraft } = useUpdateNavigationMenuItemsDraft();

  const handleRename = () => {
    const trimmed = folderRenameInput.trim();
    if (trimmed.length > 0) {
      updateFolderNameInDraft(folderId, trimmed);
      setFolderRenameInput('');
      onSuccess();
    }
  };

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Rename folder`}
      onBack={onBack}
      searchPlaceholder={t`Folder name`}
      searchValue={folderRenameInput}
      onSearchChange={setFolderRenameInput}
      searchInputProps={{
        onKeyDown: (event) => {
          if (event.key === 'Enter' && folderRenameInput.trim().length > 0) {
            handleRename();
          }
        },
      }}
    />
  );
};
