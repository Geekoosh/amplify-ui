import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { AuthServiceProvider } from '@aws-amplify/ui-react-core';
import type { AuthHubHandler, AuthServices } from '@aws-amplify/ui';

import { useAuth } from '../useAuth';

const getCurrentUserSpy = jest.fn();
const hubHandlers = new Set<AuthHubHandler>();
const subscribeToAuthHubSpy: AuthServices['subscribeToAuthHub'] = jest.fn(
  (handler) => {
    hubHandlers.add(handler);
    return () => {
      hubHandlers.delete(handler);
    };
  }
);
const authServiceValue = {
  getCurrentUser: getCurrentUserSpy,
  subscribeToAuthHub: subscribeToAuthHubSpy,
};

const wrapper = ({ children }: { children: ReactNode }) =>
  React.createElement(AuthServiceProvider, {
    children,
    value: authServiceValue,
  });

const dispatchAuthEvent = (payload: Record<string, unknown>) => {
  act(() => {
    hubHandlers.forEach((handler) => {
      handler({ payload } as Parameters<AuthHubHandler>[0]);
    });
  });
};

// hub events that return valid user object
const SUCCESS_EVENTS_WITH_USER = ['signedIn', 'signUp', 'autoSignIn'];

// hub events that return error object
const FAILURE_EVENTS_WITH_ERROR = ['tokenRefresh_failure', 'signIn_failure'];

const mockCognitoUser = {
  username: 'johndoe',
  attributes: {
    phone_number: '+1-234-567-890',
    email: 'john@doe.com',
  },
  userId: 'user-id',
};

describe('useAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
    hubHandlers.clear();
  });

  it('should return default values when initialized', async () => {
    getCurrentUserSpy.mockRejectedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBe(undefined);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should invoke getCurrentUser function', async () => {
    getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(getCurrentUserSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should set an error when something unexpected happen', async () => {
    getCurrentUserSpy.mockRejectedValue(new Error('Unknown error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
    });
  });

  it('should retrieve a Cognito user', async () => {
    getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeUndefined();
      expect(result.current.user).toBe(mockCognitoUser);
    });
  });

  it.each(SUCCESS_EVENTS_WITH_USER)(
    'should receive a Cognito user on %s Hub event',
    async (event) => {
      // turn off warning logs in console
      jest.spyOn(console, 'warn').mockImplementation();

      getCurrentUserSpy.mockRejectedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBe(undefined);
      });
      await waitFor(() => {
        expect(subscribeToAuthHubSpy).toHaveBeenCalled();
      });

      dispatchAuthEvent({ event, data: mockCognitoUser });

      expect(result.current.user).toBe(mockCognitoUser);
    }
  );

  it('should should unset user on signOut Hub event', async () => {
    // turn off warning logs in console
    jest.spyOn(console, 'warn').mockImplementation();

    getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBe(mockCognitoUser);
    });
    await waitFor(() => {
      expect(subscribeToAuthHubSpy).toHaveBeenCalled();
    });

    dispatchAuthEvent({ event: 'signedOut' });

    expect(result.current.user).toBeUndefined();
  });

  it('invokes getCurrentUser on tokenRefresh event', async () => {
    getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

    renderHook(() => useAuth(), { wrapper });

    dispatchAuthEvent({ event: 'tokenRefresh' });

    await waitFor(() => {
      expect(getCurrentUserSpy).toHaveBeenCalled();
    });
  });

  it.each(FAILURE_EVENTS_WITH_ERROR)(
    'returns error on %s event',
    async (event) => {
      getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(subscribeToAuthHubSpy).toHaveBeenCalled();
      });
      dispatchAuthEvent({
        event,
        data: new Error('mock auth error'),
      });

      await waitFor(() => {
        expect(result.current.user).toBeUndefined();
        expect(result.current.error?.message).toBe('mock auth error');
      });
    }
  );

  it('returns error on autoSignIn_failure event', async () => {
    getCurrentUserSpy.mockResolvedValue(mockCognitoUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(subscribeToAuthHubSpy).toHaveBeenCalled();
    });
    dispatchAuthEvent({
      event: 'autoSignIn_failure',
      message: 'autoSignInError',
    });

    await waitFor(() => {
      expect(result.current.user).toBeUndefined();
      expect(result.current.error?.message).toBe('autoSignInError');
    });
  });
});
