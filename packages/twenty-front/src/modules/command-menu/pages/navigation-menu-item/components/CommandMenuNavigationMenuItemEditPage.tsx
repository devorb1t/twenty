import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { selectedWorkspaceObjectMetadataItemIdInEditModeState } from '@/navigation-menu-item/states/selectedWorkspaceObjectMetadataItemIdInEditModeState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const selectedWorkspaceObjectMetadataItemIdInEditMode = useRecoilValue(
    selectedWorkspaceObjectMetadataItemIdInEditModeState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = isDefined(
    selectedWorkspaceObjectMetadataItemIdInEditMode,
  )
    ? objectMetadataItems.find(
        (item) => item.id === selectedWorkspaceObjectMetadataItemIdInEditMode,
      )
    : undefined;

  if (!selectedWorkspaceObjectMetadataItemIdInEditMode || !objectMetadataItem) {
    return (
      <StyledContainer>
        <StyledPlaceholder>{t`Select a navigation item to edit`}</StyledPlaceholder>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledPlaceholder>
        {t`Edit`} {objectMetadataItem.labelPlural}{' '}
        {t`(Move up, Move down, Remove - coming in Phase 5)`}
      </StyledPlaceholder>
    </StyledContainer>
  );
};
