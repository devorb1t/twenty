import { act, renderHook } from '@testing-library/react';

import { useOpenEmailInAppOrFallback } from '@/activities/emails/hooks/useOpenEmailInAppOrFallback';

const MOCK_CONNECTED_ACCOUNT_ID = 'connected-account-1';

const mockOpenComposeEmailInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenComposeEmailInSidePanel', () => ({
  useOpenComposeEmailInSidePanel: () => ({
    openComposeEmailInSidePanel: mockOpenComposeEmailInSidePanel,
  }),
}));

const mockUseFirstConnectedAccount = jest.fn();

jest.mock('@/activities/emails/hooks/useFirstConnectedAccount', () => ({
  useFirstConnectedAccount: (opts: unknown) =>
    mockUseFirstConnectedAccount(opts),
}));

describe('useOpenEmailInAppOrFallback', () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  it('should open the side-panel composer when a connected account exists', () => {
    mockUseFirstConnectedAccount.mockReturnValue({
      connectedAccountId: MOCK_CONNECTED_ACCOUNT_ID,
      connectedAccountHandle: 'user@example.com',
      loading: false,
    });

    const { result } = renderHook(() => useOpenEmailInAppOrFallback());

    act(() => {
      result.current.openEmail('alice@test.com');
    });

    expect(mockOpenComposeEmailInSidePanel).toHaveBeenCalledWith({
      connectedAccountId: MOCK_CONNECTED_ACCOUNT_ID,
      defaultTo: 'alice@test.com',
    });
    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('should fall back to mailto when no connected account exists', () => {
    mockUseFirstConnectedAccount.mockReturnValue({
      connectedAccountId: null,
      connectedAccountHandle: null,
      loading: false,
    });

    const { result } = renderHook(() => useOpenEmailInAppOrFallback());

    act(() => {
      result.current.openEmail('bob@test.com');
    });

    expect(windowOpenSpy).toHaveBeenCalledWith('mailto:bob@test.com', '_blank');
    expect(mockOpenComposeEmailInSidePanel).not.toHaveBeenCalled();
  });

  it('should fall back to mailto when query is still loading', () => {
    mockUseFirstConnectedAccount.mockReturnValue({
      connectedAccountId: null,
      connectedAccountHandle: null,
      loading: true,
    });

    const { result } = renderHook(() => useOpenEmailInAppOrFallback());

    act(() => {
      result.current.openEmail('eager@test.com');
    });

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'mailto:eager@test.com',
      '_blank',
    );
    expect(mockOpenComposeEmailInSidePanel).not.toHaveBeenCalled();
  });

  it('should pass skip option to useFirstConnectedAccount', () => {
    mockUseFirstConnectedAccount.mockReturnValue({
      connectedAccountId: null,
      connectedAccountHandle: null,
      loading: false,
    });

    renderHook(() => useOpenEmailInAppOrFallback({ skip: true }));

    expect(mockUseFirstConnectedAccount).toHaveBeenCalledWith({ skip: true });
  });
});
