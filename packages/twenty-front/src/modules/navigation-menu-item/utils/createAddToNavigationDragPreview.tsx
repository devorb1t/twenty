import type { Theme } from '@emotion/react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import type { IconComponent } from 'twenty-ui/display';

import { AddToNavigationDragPreview } from '@/navigation-menu-item/components/AddToNavigationDragPreview';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

export const createAddToNavigationDragPreview = ({
  label,
  icon,
  payload,
  theme,
}: {
  label: string;
  icon?: IconComponent | React.ReactNode;
  payload: AddToNavigationDragPayload;
  theme: Theme;
}) => {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    pointerEvents: 'none',
  });

  document.body.appendChild(container);

  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <RecoilRoot>
        <AddToNavigationDragPreview
          label={label}
          icon={icon}
          payload={payload}
          theme={theme}
        />
      </RecoilRoot>,
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
