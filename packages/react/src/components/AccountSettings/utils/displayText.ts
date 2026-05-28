import type { DisplayTextTemplate } from '@saasontools/amplify-ui';

// ChangePassword
export type ChangePasswordDisplayText = DisplayTextTemplate<{
  confirmPasswordFieldLabel?: string;
  currentPasswordFieldLabel?: string;
  newPasswordFieldLabel?: string;
  updatePasswordButtonText?: string;
}>;

type ChangePasswordDisplayTextDefault = Required<ChangePasswordDisplayText>;

export const defaultChangePasswordDisplayText: ChangePasswordDisplayTextDefault =
  {
    confirmPasswordFieldLabel: 'Confirm Password',
    currentPasswordFieldLabel: 'Current Password',
    newPasswordFieldLabel: 'New Password',
    updatePasswordButtonText: 'Update password',
  };

// DeleteUser
export type DeleteUserDisplayText = DisplayTextTemplate<{
  cancelButtonText?: string;
  confirmDeleteButtonText?: string;
  deleteAccountButtonText?: string;
  warningText?: string;
}>;

type DeleteUserDisplayTextDefault = Required<DeleteUserDisplayText>;

export const defaultDeleteUserDisplayText: DeleteUserDisplayTextDefault = {
  cancelButtonText: 'Cancel',
  confirmDeleteButtonText: 'Delete',
  deleteAccountButtonText: 'Delete Account',
  warningText:
    'Deleting your account is not reversible. You will lose access to your account and all data associated with it.',
};

// ManagePasskeys
export type ManagePasskeysDisplayText = DisplayTextTemplate<{
  deletePasskeyButtonText?: string;
  loadingText?: string;
  noPasskeysText?: string;
  passkeyLabelText?: string;
  registerPasskeyButtonText?: string;
}>;

type ManagePasskeysDisplayTextDefault = Required<ManagePasskeysDisplayText>;

export const defaultManagePasskeysDisplayText: ManagePasskeysDisplayTextDefault =
  {
    deletePasskeyButtonText: 'Delete',
    loadingText: 'Loading passkeys',
    noPasskeysText: 'No passkeys registered.',
    passkeyLabelText: 'Passkey',
    registerPasskeyButtonText: 'Register passkey',
  };

// ManageMFA
export type ManageMFADisplayText = DisplayTextTemplate<{
  disableTotpButtonText?: string;
  enableTotpButtonText?: string;
  loadingText?: string;
  mfaDisabledText?: string;
  mfaEnabledText?: string;
  preferredTotpButtonText?: string;
  setupTotpButtonText?: string;
  setupTotpDescriptionText?: string;
  totpCodeFieldLabel?: string;
  totpQRCodeAltText?: string;
  verifyTotpButtonText?: string;
}>;

type ManageMFADisplayTextDefault = Required<ManageMFADisplayText>;

export const defaultManageMFADisplayText: ManageMFADisplayTextDefault = {
  disableTotpButtonText: 'Disable TOTP',
  enableTotpButtonText: 'Enable TOTP',
  loadingText: 'Loading MFA settings',
  mfaDisabledText: 'TOTP is not enabled.',
  mfaEnabledText: 'TOTP is enabled.',
  preferredTotpButtonText: 'Set TOTP as preferred',
  setupTotpButtonText: 'Set up TOTP',
  setupTotpDescriptionText:
    'Scan the QR code with an authenticator app, then enter the generated code.',
  totpCodeFieldLabel: 'Verification code',
  totpQRCodeAltText: 'TOTP setup QR code',
  verifyTotpButtonText: 'Verify TOTP',
};
