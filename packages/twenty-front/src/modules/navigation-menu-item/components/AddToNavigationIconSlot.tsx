import type { ReactNode } from 'react';
import type { IconComponent } from 'twenty-ui/display';
import { isDefined } from 'twenty-shared/utils';

const isIconComponent = (
  value: IconComponent | ReactNode,
): value is IconComponent => typeof value === 'function';

type AddToNavigationIconSlotProps = {
  icon?: IconComponent | ReactNode;
  size: number | string;
  stroke: number;
  color?: string;
};

export const AddToNavigationIconSlot = ({
  icon,
  size,
  stroke,
  color,
}: AddToNavigationIconSlotProps) => {
  if (!isDefined(icon)) {
    return null;
  }
  if (isIconComponent(icon)) {
    const IconComponent = icon;
    return <IconComponent size={size} stroke={stroke} color={color} />;
  }
  return <>{icon}</>;
};
