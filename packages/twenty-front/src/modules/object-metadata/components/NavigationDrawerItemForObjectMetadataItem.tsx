import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onActiveItemClickWhenNotInEditMode?: () => void;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
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

  const navigationPath = getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
  );

  const isActive =
    currentPath ===
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

  return (
    <NavigationDrawerItem
      key={objectMetadataItem.id}
      label={objectMetadataItem.labelPlural}
      to={shouldNavigate ? navigationPath : undefined}
      onClick={handleClick}
      Icon={getIcon(objectMetadataItem.icon)}
      iconBackgroundColor={iconColors.object}
      active={isActive}
      isSelectedInEditMode={isSelectedInEditMode}
    />
  );
};
