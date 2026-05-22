import React from 'react';
import type { AuthWebAuthnCredential } from 'aws-amplify/auth';

import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { View } from '../../primitives/View';

export interface PasskeyListProps {
  credentials: AuthWebAuthnCredential[];
  passkeyLabelText: string;
  itemClassName?: string;
  textProps?: React.ComponentProps<typeof Text>;
  renderAction?: (
    credential: AuthWebAuthnCredential,
    index: number
  ) => React.ReactNode;
}

export const getPasskeyCredentialLabel = (
  credential: AuthWebAuthnCredential,
  index: number,
  passkeyLabelText: string
): string =>
  credential.friendlyCredentialName ?? `${passkeyLabelText} ${index + 1}`;

export function PasskeyList({
  credentials,
  itemClassName,
  passkeyLabelText,
  renderAction,
  textProps,
}: PasskeyListProps): React.JSX.Element {
  return (
    <Flex direction="column" gap="xs">
      {credentials.map((credential, index) => {
        const { credentialId } = credential;
        const label = getPasskeyCredentialLabel(
          credential,
          index,
          passkeyLabelText
        );
        const key = credentialId ?? index;
        const credentialView = (
          <View className={itemClassName} key={key}>
            <Text {...textProps}>{label}</Text>
          </View>
        );

        return renderAction ? (
          <Flex alignItems="center" justifyContent="space-between" key={key}>
            {credentialView}
            {renderAction(credential, index)}
          </Flex>
        ) : (
          credentialView
        );
      })}
    </Flex>
  );
}
