import { createAmplifyLogger } from '../machines/authenticator/amplifyAuthAdapter';

type LoggerCategory =
  | 'Auth'
  | 'AccountSettings'
  | 'Geo'
  | 'Notifications'
  | 'Storage';

export const getLogger = (category: LoggerCategory) =>
  createAmplifyLogger(`AmplifyUI:${category}`);
