import React from 'react';

import { Button, Flex, Text, View } from '../../../primitives';
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
    <Flex direction="column">
      {credentials.map((credential, index) => {
        const { credentialId } = credential;

        return (
          <Flex
            alignItems="center"
            justifyContent="space-between"
            key={credentialId ?? index}
          >
            <View>
              <Text>
                {credential.friendlyCredentialName ??
                  `${passkeyLabelText} ${index + 1}`}
              </Text>
            </View>
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
          </Flex>
        );
      })}
    </Flex>
  );
};

const DEFAULTS: Required<ManagePasskeysComponents> = {
  DeleteButton: DefaultDeleteButton,
  ErrorMessage: DefaultErrorMessage,
  PasskeyList: DefaultPasskeyList,
  RegisterButton: DefaultRegisterButton,
};

export default DEFAULTS;
