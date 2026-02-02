import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';

const StyledIconWithBackground = styled.div<{ backgroundColor: string }>`
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: ProcessedNavigationMenuItem;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { Icon: StandardIcon } = useGetStandardObjectIcon(
    navigationMenuItem.objectNameSingular || '',
  );
  const IconToUse =
    StandardIcon ||
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);

  const placeholderColorSeed = navigationMenuItem.targetRecordId ?? undefined;

  const iconColors = getNavigationMenuItemIconColors(theme);
  const iconBackgroundColor = isDefined(navigationMenuItem.viewId)
    ? iconColors.view
    : iconColors.object;

  return (
    <StyledIconWithBackground backgroundColor={iconBackgroundColor}>
      <Avatar
        size="md"
        type={navigationMenuItem.avatarType}
        Icon={IconToUse}
        iconColor={theme.grayScale.gray1}
        avatarUrl={navigationMenuItem.avatarUrl}
        placeholder={navigationMenuItem.labelIdentifier}
        placeholderColorSeed={placeholderColorSeed}
      />
    </StyledIconWithBackground>
  );
};
