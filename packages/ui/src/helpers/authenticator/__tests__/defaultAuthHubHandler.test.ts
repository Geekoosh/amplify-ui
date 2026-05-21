import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';
import {
  defaultAuthHubHandler,
  listenToAuthHub,
} from '../defaultAuthHubHandler';
import { AuthInterpreter } from '../types';
import { amplifyAuthAdapter } from '../../../machines/authenticator/amplifyAuthAdapter';

const MockNetworkError = { name: AmplifyErrorCode.NetworkError };
const onSignIn = jest.fn();
const onSignOut = jest.fn();
const service = { send: jest.fn() } as unknown as AuthInterpreter;

describe('defaultAuthHubHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['tokenRefresh_failure', 'signedOut'])(
    'handles a %s event as expected',
    (event) => {
      defaultAuthHubHandler({ channel: 'auth', payload: { event } }, service);
      expect(service.send).toHaveBeenCalledTimes(1);
      expect(service.send).toHaveBeenCalledWith('SIGN_OUT');
    }
  );

  it('handles a signInWithRedirect event as expected', () => {
    defaultAuthHubHandler(
      { channel: 'auth', payload: { event: 'signInWithRedirect' } },
      service
    );
    expect(service.send).toHaveBeenCalledTimes(1);
    expect(service.send).toHaveBeenCalledWith('SIGN_IN_WITH_REDIRECT');
  });

  it('calls onSignOut callabck on signedOut event if provided', () => {
    defaultAuthHubHandler(
      { channel: 'auth', payload: { event: 'signedOut' } },
      service,
      { onSignOut }
    );
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not call onSignOut callback on tokenRefresh_failure event if provided', () => {
    defaultAuthHubHandler(
      { channel: 'auth', payload: { event: 'tokenRefresh_failure' } },
      service,
      { onSignOut }
    );
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it('does not call service on tokenRefresh_failure event if NetworkError', () => {
    defaultAuthHubHandler(
      {
        channel: 'auth',
        payload: {
          event: 'tokenRefresh_failure',
          data: { error: MockNetworkError },
        },
      },
      service
    );
    expect(service.send).not.toHaveBeenCalled();
  });

  it('calls onSignIn callback on signedIn event if provided', () => {
    defaultAuthHubHandler(
      { channel: 'auth', payload: { event: 'signedIn' } },
      service,
      { onSignIn }
    );
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});

describe('listenToAuthHub', () => {
  it('subscribes through the auth adapter', () => {
    const unsubscribe = jest.fn();
    const subscribeToAuthEventsSpy = jest
      .spyOn(amplifyAuthAdapter, 'subscribeToAuthEvents')
      .mockReturnValue(unsubscribe);
    const handler = jest.fn();

    const result = listenToAuthHub(service, handler);

    expect(subscribeToAuthEventsSpy).toHaveBeenCalledTimes(1);
    expect(subscribeToAuthEventsSpy).toHaveBeenCalledWith(service, handler);
    expect(result).toBe(unsubscribe);
  });
});
