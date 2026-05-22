import QRCode from 'qrcode';
import * as React from 'react';

import {
  authenticatorTextUtil,
  getLogger,
  getTotpCodeURL,
} from '@aws-amplify/ui';

import { Flex } from '../../../primitives/Flex';
import { Heading } from '../../../primitives/Heading';
import { useAuthenticator } from '@aws-amplify/ui-react-core';
import { TotpSetupDisplay } from '../../shared';
import { useCustomComponents } from '../hooks/useCustomComponents';
import { useFormHandlers } from '../hooks/useFormHandlers';
import { ConfirmSignInFooter } from '../shared/ConfirmSignInFooter';
import { RemoteErrorMessage } from '../shared/RemoteErrorMessage';
import { FormFields } from '../shared/FormFields';
import type { RouteProps } from '../RouteContainer';
import { RouteContainer } from '../RouteContainer';

const logger = getLogger('Auth');

type LegacyQRFields = { totpIssuer?: string; totpUsername?: string };

const {
  getCopiedText,
  getLoadingText,
  getSetupTotpQRCodeAltText,
  getSetupTotpText,
} = authenticatorTextUtil;

export const SetupTotp = ({
  className,
  variation,
}: RouteProps): React.JSX.Element => {
  const { totpSecretCode, isPending, username, QRFields } = useAuthenticator(
    (context) => [context.isPending, context.totpSecretCode, context.username]
  );

  const { handleChange, handleSubmit } = useFormHandlers();

  const {
    components: {
      // @ts-ignore
      SetupTotp: { Header = SetupTotp.Header, Footer = SetupTotp.Footer },
    },
  } = useCustomComponents();

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [qrCode, setQrCode] = React.useState<string>();
  const [copyTextLabel, setCopyTextLabel] = React.useState<string>('COPY');

  const { totpIssuer = 'AWSCognito', totpUsername = username } =
    (QRFields as LegacyQRFields) ?? {};

  const generateQRCode = React.useCallback(async (): Promise<void> => {
    try {
      const totpCode = getTotpCodeURL(
        totpIssuer,
        totpUsername,
        totpSecretCode!
      );

      const qrCodeImageSource = await QRCode.toDataURL(totpCode);

      setQrCode(qrCodeImageSource);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [totpIssuer, totpUsername, totpSecretCode]);

  React.useEffect(() => {
    if (!qrCode) {
      generateQRCode();
    }
  }, [generateQRCode, qrCode]);

  const copyText = (): void => {
    navigator.clipboard.writeText(totpSecretCode!);
    setCopyTextLabel(getCopiedText());
  };

  return (
    <RouteContainer className={className} variation={variation}>
      <form
        data-amplify-form=""
        data-amplify-authenticator-setup-totp=""
        method="post"
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        <Flex as="fieldset" direction="column" isDisabled={isPending}>
          <Header />

          <Flex direction="column">
            <TotpSetupDisplay
              copyTextLabel={copyTextLabel}
              loadingText={<>{getLoadingText()}&hellip;</>}
              onCopy={copyText}
              qrCode={isLoading ? undefined : qrCode}
              qrCodeAltText={getSetupTotpQRCodeAltText()}
              qrCodeDataAttr="data-amplify-qrcode"
              secretCode={totpSecretCode!}
            />
            <FormFields />
            <RemoteErrorMessage />
          </Flex>

          <ConfirmSignInFooter />
          <Footer />
        </Flex>
      </form>
    </RouteContainer>
  );
};

SetupTotp.Header = function Header(): React.JSX.Element {
  return <Heading level={3}>{getSetupTotpText()}</Heading>;
};

SetupTotp.Footer = function Footer(): React.JSX.Element {
  // @ts-ignore
  return null;
};
