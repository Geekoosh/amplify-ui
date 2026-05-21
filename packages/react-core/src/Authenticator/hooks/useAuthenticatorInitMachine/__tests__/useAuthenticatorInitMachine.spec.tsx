import React from 'react';
import { renderHook } from '@testing-library/react';

import { useAuthenticator, UseAuthenticator } from '../../useAuthenticator';
import { mockUseAuthenticatorOutput } from '../../useAuthenticator/__mock__/useAuthenticator';
import { AuthServiceProvider } from '../../../../AuthService';

import { routeSelector } from '../useAuthenticatorInitMachine';
import { useAuthenticatorInitMachine } from '..';

jest.mock('../../useAuthenticator');

const initializeMachine = jest.fn();

describe('useAuthenticatorInitMachine', () => {
  beforeEach(() => {
    initializeMachine.mockClear();
  });

  it('calls initializeMachine only once, even after subsequent rerenders', () => {
    const route = 'setup';
    const initialData = {};
    const modifiedData = { mutated: 'dataObject' };

    (useAuthenticator as jest.Mock).mockReturnValue({
      initializeMachine,
      route,
    } as unknown as UseAuthenticator);

    const { rerender } = renderHook(
      ({ data }) => useAuthenticatorInitMachine(data),
      { initialProps: { data: initialData } }
    );

    expect(initializeMachine).toHaveBeenCalledTimes(1);

    // change the input props of the hook to get the useEffect to run again
    rerender({ data: modifiedData });

    expect(initializeMachine).toHaveBeenCalledTimes(1);
  });

  it('does not call initializeMachine when the route !== "setup"', () => {
    const route = 'idle';
    const data = {};

    (useAuthenticator as jest.Mock).mockReturnValue({
      initializeMachine,
      route,
    } as unknown as UseAuthenticator);

    renderHook(() => useAuthenticatorInitMachine(data));

    expect(initializeMachine).toHaveBeenCalledTimes(0);
  });

  it('initializes with AuthServiceProvider services when services prop is omitted', () => {
    const route = 'setup';
    const getCurrentUser = jest.fn();

    (useAuthenticator as jest.Mock).mockReturnValue({
      initializeMachine,
      route,
    } as unknown as UseAuthenticator);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthServiceProvider value={{ getCurrentUser }}>
        {children}
      </AuthServiceProvider>
    );

    renderHook(() => useAuthenticatorInitMachine({}), { wrapper });

    expect(initializeMachine).toHaveBeenCalledWith(
      expect.objectContaining({
        services: expect.objectContaining({ getCurrentUser }),
      })
    );
  });

  it('initializes with explicit services over AuthServiceProvider services', () => {
    const route = 'setup';
    const contextGetCurrentUser = jest.fn();
    const contextSignIn = jest.fn();
    const explicitGetCurrentUser = jest.fn();
    const explicitServices = { getCurrentUser: explicitGetCurrentUser };

    (useAuthenticator as jest.Mock).mockReturnValue({
      initializeMachine,
      route,
    } as unknown as UseAuthenticator);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthServiceProvider
        value={{
          getCurrentUser: contextGetCurrentUser,
          signIn: contextSignIn,
        }}
      >
        {children}
      </AuthServiceProvider>
    );

    renderHook(
      () => useAuthenticatorInitMachine({ services: explicitServices }),
      { wrapper }
    );

    expect(initializeMachine.mock.calls[0][0].services).toMatchObject({
      getCurrentUser: explicitGetCurrentUser,
      signIn: contextSignIn,
    });
  });
});

describe('routeSelector', () => {
  it('only selects the value of route', () => {
    const route = 'idle' as UseAuthenticator['route'];
    const machineContext = { ...mockUseAuthenticatorOutput, route };

    const output = routeSelector(machineContext);
    expect(output).toStrictEqual([route]);
  });
});
