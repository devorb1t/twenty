import React, { useContext } from 'react';

import { type PageLayoutType } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';
import { type TargetRecordIdentifier } from './TargetRecordIdentifier';

export type LayoutRenderingContextType = {
  // Optional target record - only present for record pages that display data about a specific record
  // Undefined for dashboards which are standalone
  // Uses ActivityTargetableObject shape for compatibility with existing components
  targetRecordIdentifier: TargetRecordIdentifier | undefined;

  layoutType: PageLayoutType;

  isInSidePanel: boolean;
};

const LayoutRenderingContext = React.createContext<
  LayoutRenderingContextType | undefined
>(undefined);

export const LayoutRenderingProvider = LayoutRenderingContext.Provider;

export const useLayoutRenderingContext = (): LayoutRenderingContextType => {
  const context = useContext(LayoutRenderingContext);

  if (context === undefined) {
    throw new Error(
      'LayoutRenderingContext not found. Please wrap your component tree with <LayoutRenderingProvider>.',
    );
  }

  return context;
};

export const useOptionalLayoutRenderingContext = ():
  | LayoutRenderingContextType
  | undefined => {
  return useContext(LayoutRenderingContext);
};
