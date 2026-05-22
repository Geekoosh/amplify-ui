/**
 * Single runtime boundary for Amplify Auth dependencies used by the
 * authenticator package.
 *
 * Authenticator code should consume `defaultServices` or this adapter instead
 * of importing `aws-amplify`, `aws-amplify/auth`, or `aws-amplify/utils`
 * directly. Keeping those imports centralized makes future service overrides
 * and fork-specific auth integrations easier to reason about.
 */
import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';
import type { ResourcesConfig } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import {
  autoSignIn,
  associateWebAuthnCredential,
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  confirmUserAttribute,
  deleteUser as deleteAuthUser,
  deleteWebAuthnCredential,
  fetchMFAPreference,
  fetchUserAttributes,
  getCurrentUser,
  listWebAuthnCredentials,
  resendSignUpCode,
  resetPassword,
  sendUserAttributeVerificationCode,
  setUpTOTP,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
  updateMFAPreference,
  updatePassword,
  verifyTOTPSetup,
} from 'aws-amplify/auth';
import type { UserAttributeKey } from 'aws-amplify/auth';
import { ConsoleLogger as Logger, Hub, I18n } from 'aws-amplify/utils';

import type {
  LoginMechanism,
  PasswordSettings,
  SocialProvider,
} from '../../types';

import type {
  AmplifyAuthAdapter,
  AmplifyConfigFacade,
  ChangePasswordInput,
} from './authServices';

type CognitoConfig = NonNullable<ResourcesConfig['Auth']>['Cognito'];
type UserAttributes = CognitoConfig['userAttributes'];
type InvalidUserAttributes = CognitoConfig['userAttributes'][];

const isInvalidUserAtributes = (
  userAttributes: UserAttributes | InvalidUserAttributes
): userAttributes is InvalidUserAttributes => Array.isArray(userAttributes);

const parseUserAttributes = (
  userAttributes: UserAttributes | InvalidUserAttributes
): UserAttributeKey[] => {
  if (!userAttributes) {
    return undefined;
  }

  // `aws-amplify` versions <= 6.0.5 return an array of `userAttributes` rather than an object
  if (isInvalidUserAtributes(userAttributes)) {
    return Object.entries(userAttributes).map(
      ([_, value]) => Object.keys(value)[0]
    );
  }

  return Object.keys(userAttributes);
};

const getAmplifyConfig = async (): Promise<AmplifyConfigFacade> => {
  const result = Amplify.getConfig();

  const cliConfig = result.Auth?.Cognito;
  const { loginWith, userAttributes } = result.Auth?.Cognito ?? {};

  const parsedLoginMechanisms = loginWith
    ? (Object.entries(loginWith)
        .filter(([key, _value]) => key !== 'oauth')
        .filter(([_key, value]) => !!value)
        .map((keyValueArray) => {
          return keyValueArray[0] === 'phone' // the key for phone_number is phone in getConfig but everywhere else we treat is as phone_number
            ? 'phone_number'
            : keyValueArray[0];
        }) as LoginMechanism[])
    : undefined;

  const parsedSignupAttributes = parseUserAttributes(userAttributes);

  const parsedSocialProviders = loginWith?.oauth?.providers
    ? (loginWith.oauth.providers?.map((provider) =>
        provider.toString().toLowerCase()
      ) as SocialProvider[])
    : undefined;

  // Detect passwordless capabilities from amplify_outputs.json
  // Support both snake_case (legacy) and camelCase (current) formats
  const passwordlessConfig = (result.Auth?.Cognito as any)?.passwordless;
  const passwordlessCapabilities = {
    emailOtpEnabled:
      passwordlessConfig?.emailOtpEnabled ??
      passwordlessConfig?.email_otp_enabled === true,
    smsOtpEnabled:
      passwordlessConfig?.smsOtpEnabled ??
      passwordlessConfig?.sms_otp_enabled === true,
    webAuthnEnabled: !!(
      passwordlessConfig?.webAuthn ?? passwordlessConfig?.web_authn
    ),
    preferredChallenge:
      passwordlessConfig?.preferredChallenge ??
      passwordlessConfig?.preferred_challenge,
  };

  return {
    ...cliConfig,
    loginMechanisms: parsedLoginMechanisms,
    signUpAttributes: parsedSignupAttributes,
    socialProviders: parsedSocialProviders,
    passwordlessCapabilities,
  };
};

const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordInput): Promise<void> => {
  await updatePassword({
    oldPassword: currentPassword,
    newPassword,
  });
};

const getPasswordPolicy = (): PasswordSettings | undefined => {
  const config: ResourcesConfig = Amplify.getConfig();
  return config?.Auth?.Cognito.passwordFormat as PasswordSettings | undefined;
};

export const createAmplifyLogger = (namespace: string) => new Logger(namespace);

export const AMPLIFY_NETWORK_ERROR = AmplifyErrorCode.NetworkError;
export const amplifyI18n = I18n;

export const amplifyAuthAdapter: AmplifyAuthAdapter = {
  getAmplifyConfig,
  getCurrentUser,
  handleSignIn: signIn,
  handleSignUp: signUp,
  handleConfirmSignIn: confirmSignIn,
  handleConfirmSignInWithAttributes: confirmSignIn,
  handleConfirmSignUp: confirmSignUp,
  handleForgotPasswordSubmit: confirmResetPassword,
  handleForgotPassword: resetPassword,
  handleResendSignUpCode: resendSignUpCode,
  handleSignOut: signOut,

  autoSignIn,
  associateWebAuthnCredential,
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  confirmUserAttribute,
  deleteUser: deleteAuthUser,
  deleteWebAuthnCredential,
  fetchMFAPreference,
  fetchUserAttributes,
  listWebAuthnCredentials,
  resendSignUpCode,
  resetPassword,
  sendUserAttributeVerificationCode,
  setUpTOTP,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
  updateMFAPreference,
  verifyTOTPSetup,

  changePassword,
  getPasswordPolicy,
  subscribeToAuthEvents(service, handler) {
    const eventHandler: Parameters<typeof Hub.listen>[1] = (data) =>
      handler(data, service);
    return Hub.listen('auth', eventHandler, 'authenticator-hub-handler');
  },
};
