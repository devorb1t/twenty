import { atom, type WritableAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { isDefined } from 'twenty-shared/utils';

import { type State } from '@/ui/utilities/state/jotai/types/State';
import { createJotaiCookieStorage } from '@/ui/utilities/state/jotai/utils/createJotaiCookieStorage';

type CookieStorageConfig<ValueType> = {
  cookieKey: string;
  attributes?: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
  };
  validateInitFn?: (payload: NonNullable<ValueType>) => boolean;
};

type StateAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

type LocalStorageOptions = { getOnInit?: boolean };

export const createAtomState = <ValueType>({
  key,
  defaultValue,
  useLocalStorage = false,
  localStorageOptions,
  useCookieStorage,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
  localStorageOptions?: LocalStorageOptions;
  useCookieStorage?: CookieStorageConfig<ValueType>;
}): State<ValueType> => {
  let baseAtom: StateAtom<ValueType>;

  if (isDefined(useCookieStorage)) {
    const storage = createJotaiCookieStorage<ValueType>({
      cookieKey: useCookieStorage.cookieKey,
      attributes: useCookieStorage.attributes,
      validateInitFn: useCookieStorage.validateInitFn,
    });
    baseAtom = atomWithStorage<ValueType>(
      useCookieStorage.cookieKey,
      defaultValue,
      storage,
      { getOnInit: true },
    ) as StateAtom<ValueType>;
  } else if (useLocalStorage) {
    const safeStorage = createJSONStorage<ValueType>(() => ({
      getItem: (k: string) => localStorage.getItem(k),
      setItem: (k: string, v: string) => {
        try {
          localStorage.setItem(k, v);
        } catch {
          // Silently ignore QuotaExceededError — the in-memory Jotai state
          // remains correct; persistence is best-effort.
        }
      },
      removeItem: (k: string) => localStorage.removeItem(k),
    }));
    baseAtom = atomWithStorage<ValueType>(
      key,
      defaultValue,
      safeStorage,
      localStorageOptions ?? undefined,
    ) as StateAtom<ValueType>;
  } else {
    baseAtom = atom(defaultValue);
  }

  baseAtom.debugLabel = key;

  return {
    type: 'State',
    key,
    atom: baseAtom,
  };
};
