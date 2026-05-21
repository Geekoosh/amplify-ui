import QRCode from 'qrcode';
import React from 'react';

import { useAuthService, useSetUserAgent } from '@aws-amplify/ui-react-core';
import { getLogger } from '@aws-amplify/ui';
import type {
  FetchMFAPreferenceOutput,
  SetUpTOTPOutput,
} from 'aws-amplify/auth';

import { useAuth } from '../../../internal';
import { Flex, Text } from '../../../primitives';
import { ComponentClassName } from '../constants';
import { VERSION } from '../../../version';
import DEFAULTS from './defaults';
import type { ManageMFAProps, ManageMFAState, TotpPreference } from './types';
import { defaultManageMFADisplayText } from '../utils';

const logger = getLogger('AccountSettings');

function ManageMFA({
  components,
  displayText: overrideDisplayText,
  onError,
  onSuccess,
}: ManageMFAProps): React.JSX.Element | null {
  const [code, setCode] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [preference, setPreference] = React.useState<FetchMFAPreferenceOutput>(
    {}
  );
  const [qrCode, setQrCode] = React.useState<string>();
  const [setupDetails, setSetupDetails] =
    React.useState<SetUpTOTPOutput | null>(null);
  const [state, setState] = React.useState<ManageMFAState>('LOADING');
  const { user, isLoading } = useAuth();
  const {
    fetchMFAPreference,
    setUpTOTP,
    updateMFAPreference,
    verifyTOTPSetup,
  } = useAuthService();

  useSetUserAgent({
    componentName: 'ManageMFA',
    packageName: 'react',
    version: VERSION,
  });

  const displayText = {
    ...defaultManageMFADisplayText,
    ...overrideDisplayText,
  };
  const { loadingText, setupTotpButtonText } = displayText;
  const isAuthenticated = !!user;

  const {
    ErrorMessage,
    PreferenceButton,
    PreferenceView,
    SetupButton,
    TotpSetupView,
    VerifyButton,
  } = React.useMemo(
    () => ({ ...DEFAULTS, ...(components ?? {}) }),
    [components]
  );

  const handleError = React.useCallback(
    (error: Error) => {
      setErrorMessage(error.message);
      setState('ERROR');
      onError?.(error);
    },
    [onError]
  );

  const loadPreference = React.useCallback(async () => {
    setState('LOADING');
    setErrorMessage(null);

    try {
      setPreference(await fetchMFAPreference());
      setState('IDLE');
    } catch (e) {
      handleError(e as Error);
    }
  }, [fetchMFAPreference, handleError]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void loadPreference();
    }
  }, [isAuthenticated, isLoading, loadPreference]);

  React.useEffect(() => {
    if (!setupDetails) {
      setQrCode(undefined);
      return;
    }

    const setupUri = setupDetails.getSetupUri('AWSCognito', user?.username);

    QRCode.toDataURL(setupUri.toString())
      .then(setQrCode)
      .catch((e) => {
        handleError(e as Error);
      });
  }, [handleError, setupDetails, user?.username]);

  const handleSetup = React.useCallback(async () => {
    setState('SETTING_UP');
    setErrorMessage(null);
    setQrCode(undefined);

    try {
      setSetupDetails(await setUpTOTP());
      setState('IDLE');
    } catch (e) {
      handleError(e as Error);
    }
  }, [handleError, setUpTOTP]);

  const handleVerify = React.useCallback(async () => {
    setState('VERIFYING');
    setErrorMessage(null);

    try {
      await verifyTOTPSetup({ code });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setSetupDetails(null);
      setCode('');
      await loadPreference();
      onSuccess?.();
    } catch (e) {
      handleError(e as Error);
    }
  }, [
    code,
    handleError,
    loadPreference,
    onSuccess,
    updateMFAPreference,
    verifyTOTPSetup,
  ]);

  const handleUpdatePreference = React.useCallback(
    async (totp: TotpPreference) => {
      setState('UPDATING');
      setErrorMessage(null);

      try {
        await updateMFAPreference({ totp });
        await loadPreference();
        onSuccess?.();
      } catch (e) {
        handleError(e as Error);
      }
    },
    [handleError, loadPreference, onSuccess, updateMFAPreference]
  );

  if (isLoading) {
    return null;
  }

  if (!user) {
    logger.warn('<ManageMFA /> requires user to be authenticated.');
    return null;
  }

  const isBusy =
    state === 'LOADING' ||
    state === 'SETTING_UP' ||
    state === 'VERIFYING' ||
    state === 'UPDATING';

  return (
    <Flex className={ComponentClassName.ManageMFA} direction="column">
      <SetupButton
        isDisabled={isBusy}
        isLoading={state === 'SETTING_UP'}
        onClick={() => void handleSetup()}
      >
        {setupTotpButtonText}
      </SetupButton>
      {state === 'LOADING' ? (
        <Text>{loadingText}</Text>
      ) : (
        <PreferenceView
          displayText={displayText}
          isDisabled={isBusy}
          onUpdatePreference={(totp) => void handleUpdatePreference(totp)}
          PreferenceButton={PreferenceButton}
          preference={preference}
        />
      )}
      {setupDetails ? (
        <TotpSetupView
          code={code}
          displayText={displayText}
          isDisabled={state === 'VERIFYING'}
          onChange={(event) => setCode(event.target.value)}
          onVerify={() => void handleVerify()}
          qrCode={qrCode}
          setupDetails={setupDetails}
          VerifyButton={VerifyButton}
        />
      ) : null}
      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}
    </Flex>
  );
}

ManageMFA.ErrorMessage = DEFAULTS.ErrorMessage;
ManageMFA.PreferenceButton = DEFAULTS.PreferenceButton;
ManageMFA.PreferenceView = DEFAULTS.PreferenceView;
ManageMFA.SetupButton = DEFAULTS.SetupButton;
ManageMFA.TotpSetupView = DEFAULTS.TotpSetupView;
ManageMFA.VerifyButton = DEFAULTS.VerifyButton;

export default ManageMFA;
