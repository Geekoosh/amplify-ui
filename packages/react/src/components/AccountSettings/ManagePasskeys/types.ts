import type React from 'react';
import type { AuthWebAuthnCredential } from 'aws-amplify/auth';

import type { ButtonComponent, ErrorMessageComponent } from '../types';
import type { ManagePasskeysDisplayText } from '../utils';

export type ManagePasskeysState =
  | 'IDLE'
  | 'LOADING'
  | 'REGISTERING'
  | 'DELETING'
  | 'ERROR';

export interface PasskeyListProps {
  credentials: AuthWebAuthnCredential[];
  DeleteButton: ButtonComponent;
  deletingCredentialId?: string | null;
  displayText: ManagePasskeysDisplayText;
  isDisabled: boolean;
  onDelete: (credentialId: string) => void;
}

export type PasskeyListComponent<Props = {}> = React.ComponentType<
  Props & PasskeyListProps
>;

export interface ManagePasskeysComponents {
  DeleteButton?: ButtonComponent;
  ErrorMessage?: ErrorMessageComponent;
  PasskeyList?: PasskeyListComponent;
  RegisterButton?: ButtonComponent;
}

export interface ManagePasskeysProps {
  /** callback after passkey registration or deletion succeeds */
  onSuccess?: () => void;

  /** callback when passkey registration, listing, or deletion fails */
  onError?: (error: Error) => void;

  /** custom component overrides */
  components?: ManagePasskeysComponents;

  /** overrides default display text */
  displayText?: ManagePasskeysDisplayText;
}
