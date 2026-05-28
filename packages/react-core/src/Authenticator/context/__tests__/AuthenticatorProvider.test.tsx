import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import * as UIModule from '@saasontools/amplify-ui';

import { useAuthenticator } from '../..';
import { AuthenticatorProvider } from '..';
import { AuthServiceProvider } from '../../../AuthService';

// mock `aws-amplify` to prevent logging auth errors during test runs
jest.mock('aws-amplify');

const getCurrentUserSpy = jest
  .spyOn(UIModule.defaultServices, 'getCurrentUser')
  .mockResolvedValue({ userId: '1234', username: 'test' });
const subscribeToAuthEventsSpy = jest.spyOn(
  UIModule.defaultServices,
  'subscribeToAuthEvents'
);

function TestComponent(): React.JSX.Element | null {
  const { authStatus } = useAuthenticator();
  return <>{authStatus}</>;
}

describe('AuthenticatorProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUserSpy.mockResolvedValue({ userId: '1234', username: 'test' });
    subscribeToAuthEventsSpy.mockReturnValue(jest.fn());
  });

  it('listens to Auth Hub events on init', async () => {
    render(
      <AuthenticatorProvider>
        <TestComponent />
      </AuthenticatorProvider>
    );

    await waitFor(() => {
      expect(subscribeToAuthEventsSpy).toHaveBeenCalledTimes(1);
      expect(subscribeToAuthEventsSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  it('uses AuthServiceProvider services on init', async () => {
    const getCurrentUser = jest.fn().mockResolvedValue({
      userId: 'custom-user',
      username: 'custom-user',
    });
    const subscribeToAuthEvents = jest.fn().mockReturnValue(jest.fn());

    render(
      <AuthServiceProvider value={{ getCurrentUser, subscribeToAuthEvents }}>
        <AuthenticatorProvider>
          <TestComponent />
        </AuthenticatorProvider>
      </AuthServiceProvider>
    );

    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
      expect(subscribeToAuthEvents).toHaveBeenCalledTimes(1);
    });
    expect(getCurrentUserSpy).not.toHaveBeenCalled();
    expect(subscribeToAuthEventsSpy).not.toHaveBeenCalled();
  });

  it('updates auth status from subscribed auth events', async () => {
    let handler!: UIModule.AuthMachineHubHandler;
    subscribeToAuthEventsSpy.mockImplementation(
      (_activeService, hubHandler) => {
        handler = hubHandler;
        return jest.fn();
      }
    );

    const { getByText } = render(
      <AuthenticatorProvider>
        <TestComponent />
      </AuthenticatorProvider>
    );

    await waitFor(() => {
      expect(subscribeToAuthEventsSpy).toHaveBeenCalledTimes(1);
    });

    const send = jest.fn();
    const eventService = {
      send,
    } as unknown as Parameters<UIModule.AuthMachineHubHandler>[1];

    act(() => {
      handler(
        { channel: 'auth', payload: { event: 'signedIn' } },
        eventService
      );
    });
    expect(getByText('authenticated')).toBeDefined();

    act(() => {
      handler(
        { channel: 'auth', payload: { event: 'signedOut' } },
        eventService
      );
    });
    expect(getByText('unauthenticated')).toBeDefined();
    expect(send).toHaveBeenCalledWith('SIGN_OUT');

    send.mockClear();
    act(() => {
      handler(
        {
          channel: 'auth',
          payload: { event: 'tokenRefresh_failure', data: { error: {} } },
        },
        eventService
      );
    });
    expect(send).toHaveBeenCalledWith('SIGN_OUT');
  });

  it('unsubscribes from listening on unmount', async () => {
    const unsubscribe = jest.fn();
    subscribeToAuthEventsSpy.mockReturnValue(unsubscribe);
    const { unmount } = render(
      <AuthenticatorProvider>
        <TestComponent />
      </AuthenticatorProvider>
    );

    act(() => {
      unmount();
    });

    await waitFor(() => {
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
  // @todo-migration
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('returns the expected value of auth status on init when a user is not signed in', async () => {
    getCurrentUserSpy.mockRejectedValueOnce(undefined);

    const { getByText } = render(
      <AuthenticatorProvider>
        <TestComponent />
      </AuthenticatorProvider>
    );

    expect(getCurrentUserSpy).toHaveBeenCalledTimes(2);

    expect(getByText('configuring')).toBeDefined();

    await waitFor(() => {
      expect(getByText('unauthenticated')).toBeDefined();
    });
  });

  // @todo-migration
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('returns the expected value of auth status on init when a user is signed in', async () => {
    const { getByText } = render(
      <AuthenticatorProvider>
        <TestComponent />
      </AuthenticatorProvider>
    );

    expect(getCurrentUserSpy).toHaveBeenCalledTimes(2);

    expect(getByText('configuring')).toBeDefined();

    await waitFor(() => {
      expect(getByText('authenticated')).toBeDefined();
    });
  });
});
