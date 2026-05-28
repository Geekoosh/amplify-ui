import React from 'react';

import {
  useAuthService,
  useSetUserAgent,
} from '@saasontools/amplify-ui-react-core';
import { getLogger } from '@saasontools/amplify-ui';
import type { AuthWebAuthnCredential } from 'aws-amplify/auth';

import { useAuth } from '../../../internal';
import { Flex, Text } from '../../../primitives';
import { ComponentClassName } from '../constants';
import { VERSION } from '../../../version';
import DEFAULTS from './defaults';
import type { ManagePasskeysProps, ManagePasskeysState } from './types';
import { defaultManagePasskeysDisplayText } from '../utils';

const logger = getLogger('AccountSettings');

function ManagePasskeys({
  components,
  displayText: overrideDisplayText,
  onError,
  onSuccess,
}: ManagePasskeysProps): React.JSX.Element | null {
  const [credentials, setCredentials] = React.useState<
    AuthWebAuthnCredential[]
  >([]);
  const [deletingCredentialId, setDeletingCredentialId] = React.useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [state, setState] = React.useState<ManagePasskeysState>('LOADING');
  const { user, isLoading } = useAuth();
  const {
    associateWebAuthnCredential,
    deleteWebAuthnCredential,
    listWebAuthnCredentials,
  } = useAuthService();

  useSetUserAgent({
    componentName: 'ManagePasskeys',
    packageName: 'react',
    version: VERSION,
  });

  const displayText = {
    ...defaultManagePasskeysDisplayText,
    ...overrideDisplayText,
  };
  const { loadingText, registerPasskeyButtonText } = displayText;
  const isAuthenticated = !!user;

  const {
    DeleteButton,
    ErrorMessage,
    PasskeyList: PasskeyListView,
    RegisterButton,
  } = React.useMemo(
    () => ({ ...DEFAULTS, ...(components ?? {}) }),
    [components]
  );

  const loadCredentials = React.useCallback(async () => {
    setState('LOADING');
    setErrorMessage(null);

    try {
      const result = await listWebAuthnCredentials();
      setCredentials(result.credentials ?? []);
      setState('IDLE');
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error.message);
      setState('ERROR');
      onError?.(error);
    }
  }, [listWebAuthnCredentials, onError]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void loadCredentials();
    }
  }, [isAuthenticated, isLoading, loadCredentials]);

  const handleRegister = React.useCallback(async () => {
    setState('REGISTERING');
    setErrorMessage(null);

    try {
      await associateWebAuthnCredential();
      await loadCredentials();
      onSuccess?.();
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error.message);
      setState('ERROR');
      onError?.(error);
    }
  }, [associateWebAuthnCredential, loadCredentials, onError, onSuccess]);

  const handleDelete = React.useCallback(
    async (credentialId: string) => {
      setState('DELETING');
      setDeletingCredentialId(credentialId);
      setErrorMessage(null);

      try {
        await deleteWebAuthnCredential({ credentialId });
        await loadCredentials();
        onSuccess?.();
      } catch (e) {
        const error = e as Error;
        setErrorMessage(error.message);
        setState('ERROR');
        onError?.(error);
      } finally {
        setDeletingCredentialId(null);
      }
    },
    [deleteWebAuthnCredential, loadCredentials, onError, onSuccess]
  );

  if (isLoading) {
    return null;
  }

  if (!user) {
    logger.warn('<ManagePasskeys /> requires user to be authenticated.');
    return null;
  }

  const isBusy =
    state === 'LOADING' || state === 'REGISTERING' || state === 'DELETING';

  return (
    <Flex className={ComponentClassName.ManagePasskeys} direction="column">
      <RegisterButton
        isDisabled={isBusy}
        isLoading={state === 'REGISTERING'}
        onClick={() => void handleRegister()}
      >
        {registerPasskeyButtonText}
      </RegisterButton>
      {state === 'LOADING' ? (
        <Text>{loadingText}</Text>
      ) : (
        <PasskeyListView
          credentials={credentials}
          DeleteButton={DeleteButton}
          deletingCredentialId={deletingCredentialId}
          displayText={displayText}
          isDisabled={isBusy}
          onDelete={(credentialId) => void handleDelete(credentialId)}
        />
      )}
      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}
    </Flex>
  );
}

ManagePasskeys.DeleteButton = DEFAULTS.DeleteButton;
ManagePasskeys.ErrorMessage = DEFAULTS.ErrorMessage;
ManagePasskeys.PasskeyList = DEFAULTS.PasskeyList;
ManagePasskeys.RegisterButton = DEFAULTS.RegisterButton;

export default ManagePasskeys;
