import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Theme } from '@emotion/react';
import type { IconComponent } from 'twenty-ui/display';

import { AddToNavigationDragPreview } from '@/navigation-menu-item/components/AddToNavigationDragPreview';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

export const createAddToNavigationDragPreview = ({
  label,
  Icon,
  icon,
  payload,
  theme,
}: {
  label: string;
  Icon?: IconComponent;
  icon?: React.ReactNode;
  payload: AddToNavigationDragPayload;
  theme: Theme;
}) => {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    pointerEvents: 'none',
  });

  document.body.appendChild(container);

  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <AddToNavigationDragPreview
        label={label}
        Icon={Icon}
        icon={icon}
        payload={payload}
        theme={theme}
      />,
    );
  });

  const previewElement = container.firstElementChild as HTMLElement | null;
  if (previewElement != null) {
    container.style.width = `${previewElement.offsetWidth}px`;
    container.style.height = `${previewElement.offsetHeight}px`;
  }

  setTimeout(() => {
    root.unmount();
    container.remove();
  }, 0);

  return container;
};
