import React from 'react';
import type { AuthWebAuthnCredential } from 'aws-amplify/auth';
import { authenticatorTextUtil } from '@saasontools/amplify-ui';

import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { Heading } from '../../../primitives/Heading';
import { Text } from '../../../primitives/Text';
import { View } from '../../../primitives/View';
import {
  useAuthenticator,
  useAuthService,
} from '@saasontools/amplify-ui-react-core';
import { IconCheckCircleFill, IconPasskey } from '../../../primitives/Icon';
import { PasskeyList } from '../../shared';
import { RemoteErrorMessage } from '../shared/RemoteErrorMessage';
import type { RouteProps } from '../RouteContainer';
import { RouteContainer } from '../RouteContainer';

const {
  getPasskeyPromptHeadingText,
  getPasskeyPromptDescriptionText,
  getCreatePasskeyText,
  getRegisteringText,
  getContinueWithoutPasskeyText,
  getPasskeyCreatedSuccessText,
  getPasskeyRegisteredText,
  getPasskeyRegistrationFailedText,
  getPasskeyLabelText,
  getExistingPasskeysText,
  getSetupAnotherPasskeyText,
  getContinueText,
} = authenticatorTextUtil;

export function PasskeyPrompt({
  className,
  variation,
}: RouteProps): React.JSX.Element {
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [credentials, setCredentials] = React.useState<
    AuthWebAuthnCredential[]
  >([]);
  const { submitForm, isPending } = useAuthenticator((context) => [
    context.submitForm,
    context.isPending,
  ]);
  const { associateWebAuthnCredential, listWebAuthnCredentials } =
    useAuthService();

  const loadCredentials = React.useCallback(async () => {
    try {
      const result = await listWebAuthnCredentials();
      setCredentials(result.credentials || []);
    } catch {
      // Silently fail - credentials list is optional
    }
  }, [listWebAuthnCredentials]);

  React.useEffect(() => {
    if (success) {
      void loadCredentials();
    }
  }, [success, loadCredentials]);

  const handleSkip = React.useCallback(() => {
    submitForm({ type: 'SKIP' });
  }, [submitForm]);

  const handleContinue = React.useCallback(() => {
    submitForm({ type: 'SUBMIT' });
  }, [submitForm]);

  const handleRegister = React.useCallback(async () => {
    try {
      setError(null);
      setIsRegistering(true);
      await associateWebAuthnCredential();
      setSuccess(true);
    } catch (err) {
      const error = err as Error & { name?: string };
      const errorName = error.name ?? '';
      const errorMessage = error.message ?? '';

      // If user canceled, skip silently without showing error
      if (
        errorName === 'PasskeyRegistrationCanceled' ||
        errorName === 'NotAllowedError' ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('ceremony has been canceled') ||
        errorMessage.includes('not allowed')
      ) {
        handleSkip();
        return;
      }

      // Show user-friendly error message
      setError(getPasskeyRegistrationFailedText());
    } finally {
      setIsRegistering(false);
    }
  }, [associateWebAuthnCredential, handleSkip]);

  if (success) {
    return (
      <RouteContainer className={className} variation={variation}>
        <Flex
          direction="column"
          padding="large"
          data-amplify-authenticator-passkeyprompt=""
        >
          <Flex direction="column" gap="xs">
            <IconCheckCircleFill className="amplify-authenticator__passkey-success-icon" />
            <Heading level={4}>{getPasskeyCreatedSuccessText()}</Heading>
            <Text>{getPasskeyRegisteredText()}</Text>
          </Flex>
          {credentials.length > 0 && (
            <View marginTop="large">
              <Heading level={5}>{getExistingPasskeysText()}</Heading>
              <View marginTop="xs">
                <PasskeyList
                  credentials={credentials}
                  itemClassName="amplify-authenticator__passkey-credential-item"
                  passkeyLabelText={getPasskeyLabelText()}
                  textProps={{ fontSize: 'small' }}
                />
              </View>
            </View>
          )}
          <Flex direction="column" gap="medium" marginTop="large">
            <Button
              onClick={() => {
                setSuccess(false);
                handleRegister();
              }}
              variation="link"
            >
              {getSetupAnotherPasskeyText()}
            </Button>
            <Button
              onClick={() => handleContinue()}
              variation="primary"
              isFullWidth
            >
              {getContinueText()}
            </Button>
          </Flex>
        </Flex>
      </RouteContainer>
    );
  }

  const isButtonDisabled = isPending || isRegistering;

  return (
    <RouteContainer className={className} variation={variation}>
      <form data-amplify-form="" data-amplify-authenticator-passkeyprompt="">
        <Flex direction="column" gap="medium">
          <Heading level={4}>{getPasskeyPromptHeadingText()}</Heading>
          <Text>{getPasskeyPromptDescriptionText()}</Text>
          <Flex justifyContent="center">
            <IconPasskey className="amplify-authenticator__passkey-icon" />
          </Flex>

          <Flex direction="column" gap="medium">
            <Button
              onClick={() => void handleRegister()}
              variation="primary"
              isDisabled={isButtonDisabled}
              isLoading={isRegistering}
              loadingText={getRegisteringText()}
            >
              {getCreatePasskeyText()}
            </Button>
            <Button
              onClick={handleSkip}
              variation="link"
              isDisabled={isButtonDisabled}
            >
              {getContinueWithoutPasskeyText()}
            </Button>

            {error && (
              <Text className="amplify-authenticator__passkey-error">
                {error}
              </Text>
            )}

            <RemoteErrorMessage />
          </Flex>
        </Flex>
      </form>
    </RouteContainer>
  );
}
