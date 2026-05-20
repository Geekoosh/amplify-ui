import {
  AMPLIFY_NETWORK_ERROR,
  amplifyAuthAdapter,
} from '../../machines/authenticator/amplifyAuthAdapter';
import { isFunction } from '../../utils';

import type { AuthInterpreter, AuthMachineHubHandler } from './types';

/**
 * Handles Amplify JS Auth hub events, by forwarding hub events as appropriate
 * xstate events.
 */
export const defaultAuthHubHandler: AuthMachineHubHandler = (
  { payload },
  service,
  options
) => {
  const { data, event } = payload;
  const { send } = service;
  const { onSignIn, onSignOut } = options ?? {};

  switch (event) {
    case 'signedIn': {
      if (isFunction(onSignIn)) {
        onSignIn(payload);
      }
      break;
    }
    case 'signInWithRedirect': {
      send('SIGN_IN_WITH_REDIRECT');
      break;
    }
    case 'signedOut': {
      if (isFunction(onSignOut)) {
        onSignOut();
      }
      send('SIGN_OUT');
      break;
    }
    case 'tokenRefresh_failure': {
      if (data?.error?.name === AMPLIFY_NETWORK_ERROR) {
        return;
      }
      send('SIGN_OUT');
      break;
    }
    default: {
      break;
    }
  }
};

/**
 * Listens to external auth Hub events and sends corresponding event to
 * the `service.send` of interest
 *
 * @param service - contains state machine `send` function
 * @param handler - auth event handler
 * @returns function that unsubscribes to the hub evenmt
 */
export const listenToAuthHub = (
  service: AuthInterpreter,
  handler: AuthMachineHubHandler = defaultAuthHubHandler
) => {
  return amplifyAuthAdapter.subscribeToAuthEvents(service, handler);
};
