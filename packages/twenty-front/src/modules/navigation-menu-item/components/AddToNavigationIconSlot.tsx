import { isValidElement, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/display';

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
  if (isValidElement(icon)) {
    return <>{icon}</>;
  }
  const Icon = icon as IconComponent;
  return <Icon size={size} stroke={stroke} color={color} />;
};
