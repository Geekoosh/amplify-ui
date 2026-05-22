import React from 'react';

import { Button, Text } from '../../../primitives';
import { PasskeyList as SharedPasskeyList } from '../../shared';
import type { ButtonComponent } from '../types';
import { DefaultErrorMessage } from '../shared/Defaults';
import { defaultManagePasskeysDisplayText } from '../utils';
import type { ManagePasskeysComponents, PasskeyListComponent } from './types';

const DefaultRegisterButton: ButtonComponent = (props) => (
  <Button {...props} variation="primary" />
);

const DefaultDeleteButton: ButtonComponent = (props) => (
  <Button {...props} variation="destructive" />
);

const DefaultPasskeyList: PasskeyListComponent = ({
  credentials,
  DeleteButton,
  deletingCredentialId,
  displayText: overrideDisplayText,
  isDisabled,
  onDelete,
}) => {
  const displayText = {
    ...defaultManagePasskeysDisplayText,
    ...overrideDisplayText,
  };
  const { deletePasskeyButtonText, noPasskeysText, passkeyLabelText } =
    displayText;

  if (credentials.length === 0) {
    return <Text>{noPasskeysText}</Text>;
  }

  return (
    <SharedPasskeyList
      credentials={credentials}
      passkeyLabelText={passkeyLabelText}
      renderAction={(credential) => {
        const { credentialId } = credential;

        return (
          <DeleteButton
            isDisabled={isDisabled || !credentialId}
            isLoading={deletingCredentialId === credentialId}
            onClick={() => {
              if (credentialId) {
                onDelete(credentialId);
              }
            }}
          >
            {deletePasskeyButtonText}
          </DeleteButton>
        );
      }}
    />
  );
};

const DEFAULTS: Required<ManagePasskeysComponents> = {
  DeleteButton: DefaultDeleteButton,
  ErrorMessage: DefaultErrorMessage,
  PasskeyList: DefaultPasskeyList,
  RegisterButton: DefaultRegisterButton,
};

export default DEFAULTS;
