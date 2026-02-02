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
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    navigationMenuItem.objectNameSingular || '',
  );
  const IconToUse =
    StandardIcon ||
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);

  const placeholderColorSeed = navigationMenuItem.targetRecordId ?? undefined;

  const isRecord = isDefined(navigationMenuItem.targetRecordId);
  const iconColors = getNavigationMenuItemIconColors(theme);
  const iconBackgroundColor = isRecord
    ? undefined
    : isDefined(navigationMenuItem.viewId)
      ? iconColors.view
      : iconColors.object;

  const iconColorToUse = iconBackgroundColor
    ? theme.grayScale.gray1
    : StandardIcon
      ? IconColor
      : theme.font.color.secondary;

  const avatar = (
    <Avatar
      size={iconBackgroundColor ? 'xs' : 'md'}
      type={navigationMenuItem.avatarType}
      Icon={IconToUse}
      iconColor={iconColorToUse}
      avatarUrl={navigationMenuItem.avatarUrl}
      placeholder={navigationMenuItem.labelIdentifier}
      placeholderColorSeed={placeholderColorSeed}
    />
  );

  if (!iconBackgroundColor) {
    return avatar;
  }

  return (
    <StyledIconWithBackground backgroundColor={iconBackgroundColor}>
      {avatar}
    </StyledIconWithBackground>
  );
};
