/**
 * Maintainer note for the SaaSOn auth seam:
 *
 * This file is primarily a compile-time conformance test. The authenticator
 * machine receives auth results through `AuthServices`, while the default
 * adapter still delegates to `aws-amplify/auth`. These type pins make sure the
 * `AuthServices` return types continue to expose the Amplify `nextStep` fields
 * consumed by authenticator actions.
 *
 * If an Amplify upgrade or upstream sync changes one of those shapes, TypeScript
 * should fail here before the fork ships a mismatched service contract. Treat
 * that failure as a review signal: compare the new Amplify output type with
 * `AuthServices` and the consuming authenticator action, then either preserve
 * the existing service shape in the adapter or update the action, service
 * contract, and this test together with an explicit migration note.
 */
import type { SignInOutput, SignUpOutput } from 'aws-amplify/auth';

import type { AuthServices } from '../authServices';

type AuthServiceSignInOutput = Awaited<
  ReturnType<AuthServices['handleSignIn']>
>;
type AuthServiceSignUpOutput = Awaited<
  ReturnType<AuthServices['handleSignUp']>
>;

type NextStepWithKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T
    : never
  : never;

type RequireNextStepKey<T, K extends PropertyKey> = [
  NextStepWithKey<T, K>,
] extends [never]
  ? { __missingNextStepKey: K }
  : NextStepWithKey<T, K>;

type ServiceSignInTotpStep = RequireNextStepKey<
  AuthServiceSignInOutput['nextStep'],
  'totpSetupDetails'
>;
type AmplifySignInTotpStep = RequireNextStepKey<
  SignInOutput['nextStep'],
  'totpSetupDetails'
>;
type ServiceSignInMfaStep = RequireNextStepKey<
  AuthServiceSignInOutput['nextStep'],
  'allowedMFATypes'
>;
type AmplifySignInMfaStep = RequireNextStepKey<
  SignInOutput['nextStep'],
  'allowedMFATypes'
>;
type ServiceSignInCodeStep = RequireNextStepKey<
  AuthServiceSignInOutput['nextStep'],
  'codeDeliveryDetails'
>;
type AmplifySignInCodeStep = RequireNextStepKey<
  SignInOutput['nextStep'],
  'codeDeliveryDetails'
>;
type ServiceSignUpCodeStep = RequireNextStepKey<
  AuthServiceSignUpOutput['nextStep'],
  'codeDeliveryDetails'
>;
type AmplifySignUpCodeStep = RequireNextStepKey<
  SignUpOutput['nextStep'],
  'codeDeliveryDetails'
>;

type PinnedSignInNextStepShape = {
  serviceSignInStep: AuthServiceSignInOutput['nextStep']['signInStep'];
  amplifySignInStep: SignInOutput['nextStep']['signInStep'];
  serviceTotpSharedSecret: NonNullable<
    ServiceSignInTotpStep['totpSetupDetails']
  >['sharedSecret'];
  amplifyTotpSharedSecret: NonNullable<
    AmplifySignInTotpStep['totpSetupDetails']
  >['sharedSecret'];
  serviceAllowedMfaTypes: NonNullable<ServiceSignInMfaStep['allowedMFATypes']>;
  amplifyAllowedMfaTypes: NonNullable<AmplifySignInMfaStep['allowedMFATypes']>;
  serviceCodeDeliveryDetails: NonNullable<
    ServiceSignInCodeStep['codeDeliveryDetails']
  >;
  amplifyCodeDeliveryDetails: NonNullable<
    AmplifySignInCodeStep['codeDeliveryDetails']
  >;
};

type PinnedSignUpNextStepShape = {
  serviceSignUpStep: AuthServiceSignUpOutput['nextStep']['signUpStep'];
  amplifySignUpStep: SignUpOutput['nextStep']['signUpStep'];
  serviceCodeDeliveryDetails: NonNullable<
    ServiceSignUpCodeStep['codeDeliveryDetails']
  >;
  amplifyCodeDeliveryDetails: NonNullable<
    AmplifySignUpCodeStep['codeDeliveryDetails']
  >;
};

const expectPinnedSignInShape = (_shape: PinnedSignInNextStepShape) =>
  undefined;
const expectPinnedSignUpShape = (_shape: PinnedSignUpNextStepShape) =>
  undefined;

describe('AuthServices Amplify shape conformance', () => {
  it('pins the SignInOutput nextStep fields consumed by authenticator actions', () => {
    const signInOutput = {
      isSignedIn: false,
      nextStep: {
        allowedMFATypes: ['SMS', 'TOTP', 'EMAIL'],
        codeDeliveryDetails: {
          attributeName: 'email',
          deliveryMedium: 'EMAIL',
          destination: 'user@example.com',
        },
        signInStep: 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP',
        totpSetupDetails: {
          getSetupUri: () => new URL('otpauth://totp/Amplify:user'),
          sharedSecret: 'totp-shared-secret',
        },
      },
    } as SignInOutput;

    const { nextStep } = signInOutput as SignInOutput & {
      nextStep: SignInOutput['nextStep'] & {
        allowedMFATypes: ['SMS', 'TOTP', 'EMAIL'];
        codeDeliveryDetails: {
          attributeName: 'email';
          deliveryMedium: 'EMAIL';
          destination: 'user@example.com';
        };
        signInStep: 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP';
        totpSetupDetails: {
          getSetupUri: () => URL;
          sharedSecret: 'totp-shared-secret';
        };
      };
    };

    expect(nextStep.signInStep).toBe('CONTINUE_SIGN_IN_WITH_TOTP_SETUP');
    expect(nextStep.totpSetupDetails.sharedSecret).toBe('totp-shared-secret');
    expect(nextStep.allowedMFATypes).toEqual(['SMS', 'TOTP', 'EMAIL']);
    expect(nextStep.codeDeliveryDetails).toEqual({
      attributeName: 'email',
      deliveryMedium: 'EMAIL',
      destination: 'user@example.com',
    });

    expectPinnedSignInShape({
      amplifyAllowedMfaTypes: nextStep.allowedMFATypes,
      amplifyCodeDeliveryDetails: nextStep.codeDeliveryDetails,
      amplifySignInStep: nextStep.signInStep,
      amplifyTotpSharedSecret: nextStep.totpSetupDetails.sharedSecret,
      serviceAllowedMfaTypes: nextStep.allowedMFATypes,
      serviceCodeDeliveryDetails: nextStep.codeDeliveryDetails,
      serviceSignInStep: nextStep.signInStep,
      serviceTotpSharedSecret: nextStep.totpSetupDetails.sharedSecret,
    });
  });

  it('pins the SignUpOutput nextStep code delivery shape', () => {
    const signUpOutput = {
      isSignUpComplete: false,
      nextStep: {
        codeDeliveryDetails: {
          attributeName: 'email',
          deliveryMedium: 'EMAIL',
          destination: 'user@example.com',
        },
        signUpStep: 'CONFIRM_SIGN_UP',
      },
      userId: 'user-id',
    } as SignUpOutput;

    const { nextStep } = signUpOutput as SignUpOutput & {
      nextStep: SignUpOutput['nextStep'] & {
        codeDeliveryDetails: {
          attributeName: 'email';
          deliveryMedium: 'EMAIL';
          destination: 'user@example.com';
        };
        signUpStep: 'CONFIRM_SIGN_UP';
      };
    };

    expect(nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
    expect(nextStep.codeDeliveryDetails).toEqual({
      attributeName: 'email',
      deliveryMedium: 'EMAIL',
      destination: 'user@example.com',
    });

    expectPinnedSignUpShape({
      amplifyCodeDeliveryDetails: nextStep.codeDeliveryDetails,
      amplifySignUpStep: nextStep.signUpStep,
      serviceCodeDeliveryDetails: nextStep.codeDeliveryDetails,
      serviceSignUpStep: nextStep.signUpStep,
    });
  });
});
