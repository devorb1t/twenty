import { createContext } from 'react';

export type AddToNavFallbackDestination = {
  droppableId: string;
  index: number;
} | null;

type NavigationDropTargetContextType = {
  activeDropTargetId: string | null;
  setActiveDropTargetId: (id: string | null) => void;
  forbiddenDropTargetId: string | null;
  setForbiddenDropTargetId: (id: string | null) => void;
  addToNavFallbackDestination: AddToNavFallbackDestination;
};

export const NavigationDropTargetContext =
  createContext<NavigationDropTargetContextType>({
    activeDropTargetId: null,
    setActiveDropTargetId: () => {},
    forbiddenDropTargetId: null,
    setForbiddenDropTargetId: () => {},
    addToNavFallbackDestination: null,
  });
