import { useState } from 'react';

export type EditSubView =
  | 'object-picker'
  | 'object-picker-system'
  | 'folder-picker'
  | 'view-picker'
  | null;

export const useNavigationMenuItemEditSubView = () => {
  const [editSubView, setEditSubView] = useState<EditSubView>(null);

  const setFolderPicker = () => setEditSubView('folder-picker');
  const setObjectPicker = () => setEditSubView('object-picker');
  const setObjectPickerSystem = () => setEditSubView('object-picker-system');
  const setViewPicker = () => setEditSubView('view-picker');
  const clearSubView = () => setEditSubView(null);

  return {
    editSubView,
    setFolderPicker,
    setObjectPicker,
    setObjectPickerSystem,
    setViewPicker,
    clearSubView,
  };
};
