import { createAmplifyLogger } from '../machines/authenticator/amplifyAuthAdapter';

type LoggerCategory =
  | 'Auth'
  | 'AccountSettings'
  | 'Geo'
  | 'Notifications'
  | 'Storage';

export const getLogger = (category: LoggerCategory, scope?: string) => {
  const namespace = scope
    ? `AmplifyUI:${category}:${scope}`
    : `AmplifyUI:${category}`;

  return createAmplifyLogger(namespace);
};
