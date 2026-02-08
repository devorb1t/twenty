import type { ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/display';

const isIconComponent = (
  value: IconComponent | ReactNode,
): value is IconComponent =>
  typeof value === 'function' ||
  (isDefined(value) && typeof value === 'object');

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
    const Icon = icon;
    return <Icon size={size} stroke={stroke} color={color} />;
  }
  return <>{icon}</>;
};
