import { hasSpecialChars } from '../../helpers/authenticator/utils';

import type {
  AuthFormData,
  AuthTouchData,
  PasswordSettings,
  ValidatorResult,
} from '../../types';
import { amplifyAuthAdapter } from './amplifyAuthAdapter';
import type { AuthServices } from './authServices';

// Cognito does not allow a password length less then 8 characters
const DEFAULT_COGNITO_PASSWORD_MIN_LENGTH = 8;

export const defaultServices: AuthServices = {
  ...amplifyAuthAdapter,

  // Validation hooks for overriding
  async validateCustomSignUp(
    _: AuthFormData,
    __: AuthTouchData
  ): Promise<ValidatorResult> {},
  async validateFormPassword(
    formData: AuthFormData,
    touchData: AuthTouchData,
    passwordSettings: PasswordSettings
  ): Promise<ValidatorResult> {
    const { password } = formData;

    const { password: touched_password } = touchData;

    /**
     * If the password is not touched,
     * or if the password settings are not set, we don't need to validate it.
     */
    if (!touched_password || !passwordSettings) return null;

    const password_complexity = [];

    const policyMinLength =
      passwordSettings.minLength ?? DEFAULT_COGNITO_PASSWORD_MIN_LENGTH;
    if (password.length < policyMinLength) {
      password_complexity.push(
        `Password must have at least ${policyMinLength} characters`
      );
    }

    if (passwordSettings.requireLowercase && !/[a-z]/.test(password))
      password_complexity.push('Password must have lower case letters');

    if (passwordSettings.requireUppercase && !/[A-Z]/.test(password))
      password_complexity.push('Password must have upper case letters');

    if (passwordSettings.requireNumbers && !/[0-9]/.test(password))
      password_complexity.push('Password must have numbers');

    // https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html
    if (passwordSettings.requireSpecialCharacters && !hasSpecialChars(password))
      password_complexity.push('Password must have special characters');

    /**
     * Only return an error if there is at least one error.
     */
    return password_complexity.length !== 0
      ? { password: password_complexity }
      : null;
  },
  async validateConfirmPassword(
    formData: AuthFormData,
    touchData: AuthTouchData
  ): Promise<ValidatorResult> {
    const { password, confirm_password } = formData;

    const {
      confirm_password: touched_confirm_password,
      password: touched_password,
    } = touchData;

    if (!password && !confirm_password) {
      // these inputs are clean, don't complain yet
      return null;
    } else if (
      (password || confirm_password) &&
      password !== confirm_password &&
      ((touched_confirm_password && touched_password) ||
        (password?.length >= 6 && confirm_password?.length >= 6))
    ) {
      // Only return an error if both fields have text entered,
      // the passwords do not match, and the fields have been
      // touched or the password and confirm password is longer then or equal to 6.
      return {
        confirm_password: 'Your passwords must match',
      };
    }
  },
  async validatePreferredUsername(
    _: AuthFormData,
    __: AuthTouchData
  ): Promise<ValidatorResult> {},
  async validateRequiredFieldsForAuthMethod(
    formData: AuthFormData
  ): Promise<ValidatorResult> {
    const authMethod = formData.__authMethod;

    // If no auth method specified, skip validation (will use default required fields)
    if (!authMethod) return null;

    // Check required fields based on auth method
    if (authMethod === 'EMAIL_OTP' && !formData.email) {
      return { email: 'Email is required for Email OTP sign up' };
    }

    if (authMethod === 'SMS_OTP' && !formData.phone_number) {
      return { phone_number: 'Phone number is required for SMS OTP sign up' };
    }

    if (authMethod === 'PASSWORD') {
      const errors: Record<string, string> = {};

      if (!formData.password) {
        errors.password = 'Password is required';
      }

      if (!formData.confirm_password) {
        errors.confirm_password = 'Confirm Password is required';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    }

    return null;
  },
};
