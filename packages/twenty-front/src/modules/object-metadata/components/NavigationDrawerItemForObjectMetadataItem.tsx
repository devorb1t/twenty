import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  navigationMenuItem?: ProcessedNavigationMenuItem;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onActiveItemClickWhenNotInEditMode?: () => void;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
  navigationMenuItem,
  isEditMode = false,
  isSelectedInEditMode = false,
  onEditModeClick,
  onActiveItemClickWhenNotInEditMode,
}: NavigationDrawerItemForObjectMetadataItemProps) => {
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const lastVisitedViewId =
    lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id];

  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const isRecord =
    isDefined(navigationMenuItem?.targetRecordId) &&
    isDefined(navigationMenuItem?.link) &&
    isDefined(navigationMenuItem?.labelIdentifier);

  const navigationPath = isRecord
    ? navigationMenuItem!.link
    : getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
      );

  const isActive = isRecord
    ? currentPath === navigationMenuItem!.link
    : currentPath ===
        getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: objectMetadataItem.namePlural,
        }) ||
      currentPath.includes(
        getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: objectMetadataItem.nameSingular,
          objectRecordId: '',
        }) + '/',
      );

  const shouldUseClickHandler = isEditMode
    ? Boolean(onEditModeClick)
    : isActive && Boolean(onActiveItemClickWhenNotInEditMode);

  const handleClick = shouldUseClickHandler
    ? isEditMode
      ? onEditModeClick
      : onActiveItemClickWhenNotInEditMode
    : undefined;

  const shouldNavigate =
    !isEditMode && !(isActive && onActiveItemClickWhenNotInEditMode);

  const label = isRecord
    ? navigationMenuItem!.labelIdentifier
    : objectMetadataItem.labelPlural;

  const Icon = isRecord
    ? () => (
        <Avatar
          type={
            objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
              ? 'squared'
              : 'rounded'
          }
          avatarUrl={navigationMenuItem!.avatarUrl}
          placeholderColorSeed={navigationMenuItem!.targetRecordId ?? undefined}
          placeholder={navigationMenuItem!.labelIdentifier}
        />
      )
    : getIcon(objectMetadataItem.icon);

  const iconBackgroundColor = isRecord ? undefined : iconColors.object;

  return (
    <NavigationDrawerItem
      label={label}
      to={shouldNavigate ? navigationPath : undefined}
      onClick={handleClick}
      Icon={Icon}
      iconBackgroundColor={iconBackgroundColor}
      active={isActive}
      isSelectedInEditMode={isSelectedInEditMode}
    />
  );
};
