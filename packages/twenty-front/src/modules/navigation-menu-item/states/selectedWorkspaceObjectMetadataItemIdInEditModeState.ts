import { atom } from 'recoil';

export const selectedWorkspaceObjectMetadataItemIdInEditModeState = atom<
  string | null
>({
  key: 'selectedWorkspaceObjectMetadataItemIdInEditModeState',
  default: null,
});
