import type { ResourcesConfig } from 'aws-amplify';
import type * as AmplifyAuth from 'aws-amplify/auth';
import type { UserAttributeKey } from 'aws-amplify/auth';

import type {
  AuthHubHandler,
  AuthInterpreter,
  AuthMachineHubHandler,
} from '../../helpers/authenticator/types';
import type {
  AuthFormData,
  AuthTouchData,
  LoginMechanism,
  PasswordSettings,
  SocialProvider,
  ValidatorResult,
} from '../../types';

import type { PasswordlessCapabilities } from './types';

type CognitoConfig = NonNullable<ResourcesConfig['Auth']>['Cognito'];
type SendUserAttributeVerificationCode =
  typeof AmplifyAuth.sendUserAttributeVerificationCode;

/**
 * Normalized subset of Amplify Auth configuration consumed by the
 * authenticator machine. This facade keeps machine code independent from
 * Amplify's raw config shape while preserving the fields the UI already uses.
 */
export type AmplifyConfigFacade = Partial<CognitoConfig> & {
  loginMechanisms?: LoginMechanism[];
  signUpAttributes?: UserAttributeKey[];
  socialProviders?: SocialProvider[];
  passwordlessCapabilities: PasswordlessCapabilities;
};

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Complete service contract for the authenticator machine.
 *
 * `defaultServices` satisfies this interface, while host applications can
 * provide `Partial<AuthServices>` overrides for custom auth behavior. Runtime
 * Amplify calls should be routed through the matching service member instead
 * of being imported directly into machine or helper modules.
 */
export interface AuthServices {
  getAmplifyConfig(): Promise<AmplifyConfigFacade>;
  getCurrentUser: typeof AmplifyAuth.getCurrentUser;
  handleSignIn: typeof AmplifyAuth.signIn;
  handleSignUp: typeof AmplifyAuth.signUp;
  handleConfirmSignIn: typeof AmplifyAuth.confirmSignIn;
  handleConfirmSignInWithAttributes: typeof AmplifyAuth.confirmSignIn;
  handleConfirmSignUp: typeof AmplifyAuth.confirmSignUp;
  handleForgotPasswordSubmit: typeof AmplifyAuth.confirmResetPassword;
  handleForgotPassword: typeof AmplifyAuth.resetPassword;
  handleResendSignUpCode: typeof AmplifyAuth.resendSignUpCode;
  handleSignOut: typeof AmplifyAuth.signOut;

  autoSignIn: typeof AmplifyAuth.autoSignIn;
  associateWebAuthnCredential: typeof AmplifyAuth.associateWebAuthnCredential;
  confirmResetPassword: typeof AmplifyAuth.confirmResetPassword;
  confirmSignIn: typeof AmplifyAuth.confirmSignIn;
  confirmSignUp: typeof AmplifyAuth.confirmSignUp;
  confirmUserAttribute: typeof AmplifyAuth.confirmUserAttribute;
  deleteWebAuthnCredential: typeof AmplifyAuth.deleteWebAuthnCredential;
  fetchUserAttributes: typeof AmplifyAuth.fetchUserAttributes;
  fetchMFAPreference: typeof AmplifyAuth.fetchMFAPreference;
  listWebAuthnCredentials: typeof AmplifyAuth.listWebAuthnCredentials;
  resendSignUpCode: typeof AmplifyAuth.resendSignUpCode;
  resetPassword: typeof AmplifyAuth.resetPassword;
  sendUserAttributeVerificationCode: SendUserAttributeVerificationCode;
  setUpTOTP: typeof AmplifyAuth.setUpTOTP;
  signIn: typeof AmplifyAuth.signIn;
  signInWithRedirect: typeof AmplifyAuth.signInWithRedirect;
  signOut: typeof AmplifyAuth.signOut;
  signUp: typeof AmplifyAuth.signUp;
  updateMFAPreference: typeof AmplifyAuth.updateMFAPreference;
  verifyTOTPSetup: typeof AmplifyAuth.verifyTOTPSetup;

  changePassword(input: ChangePasswordInput): Promise<void>;
  deleteUser: typeof AmplifyAuth.deleteUser;
  getPasswordPolicy(): PasswordSettings | undefined;
  /**
   * Passive Auth Hub subscription for consumers that only observe auth events.
   * Use `subscribeToAuthEvents` when the handler also needs to drive the
   * authenticator state machine via `service.send`.
   */
  subscribeToAuthHub(
    handler: AuthHubHandler,
    listenerName?: string
  ): () => void;
  subscribeToAuthEvents(
    service: AuthInterpreter,
    handler: AuthMachineHubHandler
  ): () => void;

  validateCustomSignUp(
    formData: AuthFormData,
    touchData: AuthTouchData
  ): Promise<ValidatorResult>;
  validateFormPassword(
    formData: AuthFormData,
    touchData: AuthTouchData,
    passwordSettings: PasswordSettings
  ): Promise<ValidatorResult>;
  validateConfirmPassword(
    formData: AuthFormData,
    touchData: AuthTouchData
  ): Promise<ValidatorResult>;
  validatePreferredUsername(
    formData: AuthFormData,
    touchData: AuthTouchData
  ): Promise<ValidatorResult>;
  validateRequiredFieldsForAuthMethod(
    formData: AuthFormData
  ): Promise<ValidatorResult>;
}

export type AuthValidatorKey =
  | 'validateCustomSignUp'
  | 'validateFormPassword'
  | 'validateConfirmPassword'
  | 'validatePreferredUsername'
  | 'validateRequiredFieldsForAuthMethod';

/**
 * Runtime Amplify adapter shape. Validators stay in `defaultServices`, so this
 * type represents only the operations backed by Amplify and related utilities.
 */
export type AmplifyAuthAdapter = Omit<AuthServices, AuthValidatorKey>;
