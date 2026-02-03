import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();

  const objectMetadataItem = selectedNavigationMenuItemInEditMode
    ? objectMetadataItems.find(
        (item) => item.id === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  const selectedFolder = selectedNavigationMenuItemInEditMode
    ? workspaceNavigationMenuItemsByFolder.find(
        (folder) => folder.folderId === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  const selectedItemLabel = objectMetadataItem
    ? objectMetadataItem.labelPlural
    : selectedFolder
      ? selectedFolder.folderName
      : null;

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledContainer>
        <StyledPlaceholder>{t`Select a navigation item to edit`}</StyledPlaceholder>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledPlaceholder>
        {t`Edit`} {selectedItemLabel}{' '}
        {t`(Move up, Move down, Remove - coming in Phase 5)`}
      </StyledPlaceholder>
    </StyledContainer>
  );
};
