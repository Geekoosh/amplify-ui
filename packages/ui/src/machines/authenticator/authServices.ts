import type { ResourcesConfig } from 'aws-amplify';
import type * as AmplifyAuth from 'aws-amplify/auth';
import type { UserAttributeKey } from 'aws-amplify/auth';

import type {
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

type SendUserAttributeVerificationCode =
  typeof AmplifyAuth.sendUserAttributeVerificationCode;

export type AmplifyConfigFacade = Partial<
  ResourcesConfig['Auth']['Cognito']
> & {
  loginMechanisms?: LoginMechanism[];
  signUpAttributes?: UserAttributeKey[];
  socialProviders?: SocialProvider[];
  passwordlessCapabilities: PasswordlessCapabilities;
};

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthServices {
  getAmplifyConfig(): Promise<AmplifyConfigFacade>;
  getCurrentUser: typeof AmplifyAuth.getCurrentUser;
  handleSignIn: typeof AmplifyAuth.signIn;
  handleSignUp: typeof AmplifyAuth.signUp;
  handleConfirmSignIn: typeof AmplifyAuth.confirmSignIn;
  handleConfirmSignUp: typeof AmplifyAuth.confirmSignUp;
  handleForgotPasswordSubmit: typeof AmplifyAuth.confirmResetPassword;
  handleForgotPassword: typeof AmplifyAuth.resetPassword;
  handleResendSignUpCode: typeof AmplifyAuth.resendSignUpCode;

  autoSignIn: typeof AmplifyAuth.autoSignIn;
  associateWebAuthnCredential: typeof AmplifyAuth.associateWebAuthnCredential;
  confirmResetPassword: typeof AmplifyAuth.confirmResetPassword;
  confirmSignIn: typeof AmplifyAuth.confirmSignIn;
  confirmSignUp: typeof AmplifyAuth.confirmSignUp;
  confirmUserAttribute: typeof AmplifyAuth.confirmUserAttribute;
  fetchUserAttributes: typeof AmplifyAuth.fetchUserAttributes;
  listWebAuthnCredentials: typeof AmplifyAuth.listWebAuthnCredentials;
  resendSignUpCode: typeof AmplifyAuth.resendSignUpCode;
  resetPassword: typeof AmplifyAuth.resetPassword;
  sendUserAttributeVerificationCode: SendUserAttributeVerificationCode;
  signIn: typeof AmplifyAuth.signIn;
  signInWithRedirect: typeof AmplifyAuth.signInWithRedirect;
  signOut: typeof AmplifyAuth.signOut;
  signUp: typeof AmplifyAuth.signUp;

  changePassword(input: ChangePasswordInput): Promise<void>;
  deleteUser: typeof AmplifyAuth.deleteUser;
  getPasswordPolicy(): PasswordSettings | undefined;
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

export type AmplifyAuthAdapter = Omit<AuthServices, AuthValidatorKey>;
