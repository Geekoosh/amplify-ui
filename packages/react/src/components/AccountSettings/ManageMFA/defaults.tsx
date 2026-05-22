import React from 'react';

import { Button, Flex, Text, TextField, View } from '../../../primitives';
import { TotpSetupDisplay } from '../../shared';
import type { ButtonComponent, SubmitButtonComponent } from '../types';
import { DefaultErrorMessage } from '../shared/Defaults';
import { defaultManageMFADisplayText } from '../utils';
import type {
  ManageMFAComponents,
  PreferenceViewComponent,
  TotpSetupViewComponent,
} from './types';

const DefaultSetupButton: ButtonComponent = (props) => (
  <Button {...props} variation="primary" />
);

const DefaultVerifyButton: SubmitButtonComponent = (props) => (
  <Button {...props} variation="primary" />
);

const DefaultPreferenceButton: ButtonComponent = (props) => (
  <Button {...props} variation="link" />
);

const DefaultPreferenceView: PreferenceViewComponent = ({
  displayText: overrideDisplayText,
  isDisabled,
  onUpdatePreference,
  PreferenceButton,
  preference,
}) => {
  const displayText = {
    ...defaultManageMFADisplayText,
    ...overrideDisplayText,
  };
  const {
    disableTotpButtonText,
    enableTotpButtonText,
    mfaDisabledText,
    mfaEnabledText,
    preferredTotpButtonText,
  } = displayText;
  const isTotpEnabled = preference.enabled?.includes('TOTP') ?? false;

  return (
    <Flex direction="column">
      <Text>{isTotpEnabled ? mfaEnabledText : mfaDisabledText}</Text>
      <Flex>
        <PreferenceButton
          isDisabled={isDisabled}
          onClick={() => onUpdatePreference('ENABLED')}
        >
          {enableTotpButtonText}
        </PreferenceButton>
        <PreferenceButton
          isDisabled={isDisabled || !isTotpEnabled}
          onClick={() => onUpdatePreference('PREFERRED')}
        >
          {preferredTotpButtonText}
        </PreferenceButton>
        <PreferenceButton
          isDisabled={isDisabled || !isTotpEnabled}
          onClick={() => onUpdatePreference('DISABLED')}
          variation="destructive"
        >
          {disableTotpButtonText}
        </PreferenceButton>
      </Flex>
    </Flex>
  );
};

const DefaultTotpSetupView: TotpSetupViewComponent = ({
  code,
  displayText: overrideDisplayText,
  isDisabled,
  onChange,
  onVerify,
  qrCode,
  setupDetails,
  VerifyButton,
}) => {
  const displayText = {
    ...defaultManageMFADisplayText,
    ...overrideDisplayText,
  };
  const {
    loadingText,
    setupTotpDescriptionText,
    totpCodeFieldLabel,
    totpQRCodeAltText,
    verifyTotpButtonText,
  } = displayText;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDisabled && code.length > 0) {
      onVerify();
    }
  };

  return (
    <View as="form" onSubmit={handleSubmit}>
      <Flex direction="column">
        <Text>{setupTotpDescriptionText}</Text>
        <TotpSetupDisplay
          loadingText={loadingText}
          qrCode={qrCode}
          qrCodeAltText={totpQRCodeAltText}
          qrCodeDataAttr="data-amplify-accountsettings-mfa-qrcode"
          secretCode={setupDetails.sharedSecret}
          secretDataAttr="data-amplify-accountsettings-mfa-shared-secret"
        />
        <TextField
          label={totpCodeFieldLabel}
          name="totpCode"
          onChange={onChange}
          value={code}
        />
        <VerifyButton
          isDisabled={isDisabled || code.length === 0}
          isLoading={isDisabled}
          type="submit"
        >
          {verifyTotpButtonText}
        </VerifyButton>
      </Flex>
    </View>
  );
};

const DEFAULTS: Required<ManageMFAComponents> = {
  ErrorMessage: DefaultErrorMessage,
  PreferenceButton: DefaultPreferenceButton,
  PreferenceView: DefaultPreferenceView,
  SetupButton: DefaultSetupButton,
  TotpSetupView: DefaultTotpSetupView,
  VerifyButton: DefaultVerifyButton,
};

export default DEFAULTS;
