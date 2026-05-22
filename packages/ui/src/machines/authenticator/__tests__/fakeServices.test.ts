import { setImmediate } from 'timers';
import { interpret } from 'xstate';

import { createAuthenticatorMachine } from '..';
import type { AuthServices } from '../authServices';

jest.mock('@aws-amplify/core/internals/utils', () => ({
  ...jest.requireActual('@aws-amplify/core/internals/utils'),
  AmplifyErrorCode: { NetworkError: 'NetworkError' },
}));
jest.mock('aws-amplify', () => ({
  Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('aws-amplify/auth', () => ({}));
jest.mock('aws-amplify/utils', () => ({
  ConsoleLogger: jest.fn(),
  Hub: { listen: jest.fn(() => jest.fn()) },
  I18n: { get: jest.fn((phrase) => phrase) },
}));

const flushPromises = () => new Promise(setImmediate);

const getLoadedAmplifyAuthModules = () =>
  Object.keys(require.cache).filter((path) =>
    /node_modules[\\/](aws-amplify)[\\/](auth|utils)/.test(path)
  );

const waitForState = async (predicate: () => boolean) => {
  for (let index = 0; index < 20; index += 1) {
    await flushPromises();
    if (predicate()) {
      return;
    }
  }

  throw new Error('Timed out waiting for authenticator state');
};

describe('authenticator machine with fake services', () => {
  let service;

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    service?.stop();
  });

  it('drives sign-in confirmation through sign-out without loading real Amplify auth modules', async () => {
    let isSignedIn = false;
    const user = { userId: 'user-id', username: 'user@example.com' };
    const handleSignIn = jest.fn(async () => ({
      isSignedIn: false,
      nextStep: {
        codeDeliveryDetails: {
          attributeName: 'email',
          deliveryMedium: 'EMAIL' as const,
          destination: 'user@example.com',
        },
        signInStep: 'CONFIRM_SIGN_IN_WITH_TOTP_CODE' as const,
      },
    }));
    const handleConfirmSignIn = jest.fn(async () => {
      isSignedIn = true;
      return {
        isSignedIn: true,
        nextStep: { signInStep: 'DONE' as const },
      };
    });
    const handleSignOut = jest.fn(async () => {
      isSignedIn = false;
    });

    const fakeServices = {
      fetchUserAttributes: jest.fn(async () => ({
        email: 'user@example.com',
        email_verified: 'true',
      })),
      getAmplifyConfig: jest.fn(async () => ({
        loginMechanisms: ['email' as const],
        passwordlessCapabilities: {
          emailOtpEnabled: false,
          smsOtpEnabled: false,
          webAuthnEnabled: false,
        },
        signUpAttributes: [],
        socialProviders: [],
      })),
      getCurrentUser: jest.fn(async () => {
        if (!isSignedIn) {
          throw new Error('No signed-in user');
        }
        return user;
      }),
      handleConfirmSignIn:
        handleConfirmSignIn as unknown as AuthServices['handleConfirmSignIn'],
      handleSignIn: handleSignIn as unknown as AuthServices['handleSignIn'],
      handleSignOut: handleSignOut as unknown as AuthServices['handleSignOut'],
      listWebAuthnCredentials: jest.fn(async () => ({ credentials: [] })),
      subscribeToAuthEvents: jest.fn(() => jest.fn()),
    } as Partial<AuthServices>;

    service = interpret(
      createAuthenticatorMachine({
        services: fakeServices,
        useNextWaitConfig: true,
      })
    ).start();

    await waitForState(
      () => service?.getSnapshot().matches({ signInActor: 'runActor' })
    );

    service.send({
      type: 'SUBMIT',
      data: { password: 'password', username: 'user@example.com' },
    });

    await waitForState(() => {
      const actorState = service?.getSnapshot().context.actorRef?.getSnapshot();
      return actorState?.matches({ confirmSignIn: 'edit' }) ?? false;
    });

    service.send({
      type: 'SUBMIT',
      data: { confirmation_code: '123456' },
    });

    await waitForState(
      () => service?.getSnapshot().matches({ authenticated: 'idle' })
    );

    service.send({ type: 'SIGN_OUT' });

    await waitForState(
      () => service?.getSnapshot().matches({ signInActor: 'runActor' })
    );

    expect(handleSignIn).toHaveBeenCalledWith({
      password: 'password',
      username: 'user@example.com',
    });
    expect(handleConfirmSignIn).toHaveBeenCalledWith({
      challengeResponse: '123456',
    });
    expect(handleSignOut).toHaveBeenCalledTimes(1);
    expect(getLoadedAmplifyAuthModules()).toEqual([]);
  });
});
