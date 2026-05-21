import type React from 'react';
import type {
  FetchMFAPreferenceOutput,
  SetUpTOTPOutput,
  UpdateMFAPreferenceInput,
} from 'aws-amplify/auth';

import type { ButtonComponent, ErrorMessageComponent } from '../types';
import type { ManageMFADisplayText } from '../utils';

export type ManageMFAState =
  | 'IDLE'
  | 'LOADING'
  | 'SETTING_UP'
  | 'VERIFYING'
  | 'UPDATING'
  | 'ERROR';

export type TotpPreference = NonNullable<UpdateMFAPreferenceInput['totp']>;

export interface PreferenceViewProps {
  displayText: ManageMFADisplayText;
  isDisabled: boolean;
  onUpdatePreference: (preference: TotpPreference) => void;
  PreferenceButton: ButtonComponent;
  preference: FetchMFAPreferenceOutput;
}

export type PreferenceViewComponent<Props = {}> = React.ComponentType<
  Props & PreferenceViewProps
>;

export interface TotpSetupViewProps {
  code: string;
  displayText: ManageMFADisplayText;
  isDisabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  qrCode?: string;
  setupDetails: SetUpTOTPOutput;
  VerifyButton: ButtonComponent;
}

export type TotpSetupViewComponent<Props = {}> = React.ComponentType<
  Props & TotpSetupViewProps
>;

export interface ManageMFAComponents {
  ErrorMessage?: ErrorMessageComponent;
  PreferenceButton?: ButtonComponent;
  PreferenceView?: PreferenceViewComponent;
  SetupButton?: ButtonComponent;
  TotpSetupView?: TotpSetupViewComponent;
  VerifyButton?: ButtonComponent;
}

export interface ManageMFAProps {
  /** callback after MFA setup or preference update succeeds */
  onSuccess?: () => void;

  /** callback when MFA setup, verification, preference loading, or update fails */
  onError?: (error: Error) => void;

  /** custom component overrides */
  components?: ManageMFAComponents;

  /** overrides default display text */
  displayText?: ManageMFADisplayText;
}
