export type { AuthenticatorProps } from './Authenticator';
export { Authenticator } from './Authenticator';
export type {
  WithAuthenticatorOptions,
  WithAuthenticatorProps,
} from './withAuthenticator';
export { withAuthenticator } from './withAuthenticator';

// re-export shared `Authenticator` exports
export type { UseAuthenticator } from '@saasontools/amplify-ui-react-core';
export { useAuthenticator } from '@saasontools/amplify-ui-react-core';
