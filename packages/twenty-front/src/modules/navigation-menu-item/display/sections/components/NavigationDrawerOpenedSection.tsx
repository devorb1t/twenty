import { useLingui } from '@lingui/react/macro';
import { useLocation, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { activeNavigationItemState } from '@/navigation-menu-item/common/states/activeNavigationItemState';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { shouldShowOpenedSection } from '@/navigation-menu-item/display/sections/utils/shouldShowOpenedSection';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const activeNavigationItem = useAtomStateValue(activeNavigationItemState);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const {
    objectNamePlural: currentObjectNamePlural,
    objectNameSingular: currentObjectNameSingular,
  } = useParams();

  const objectMetadataItem = activeObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular,
  );

  const isExpanded = shouldShowOpenedSection({
    objectMetadataItem,
    pathname,
    activeNavigationItem,
    workspaceNavigationMenuItems,
    objectMetadataItems,
    views,
  });

  return (
    <AnimatedExpandableContainer isExpanded={isExpanded}>
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={
          isDefined(objectMetadataItem) ? [objectMetadataItem] : []
        }
      />
    </AnimatedExpandableContainer>
  );
};
