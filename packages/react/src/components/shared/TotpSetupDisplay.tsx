import React from 'react';

import { Flex } from '../../primitives/Flex';

const getDataAttr = (dataAttr?: string): Record<string, string> =>
  dataAttr ? { [dataAttr]: '' } : {};

export interface TotpSetupDisplayProps {
  copyTextLabel?: string;
  loadingText: React.ReactNode;
  onCopy?: () => void;
  qrCode?: string;
  qrCodeAltText: string;
  qrCodeDataAttr?: string;
  secretCode: string;
  secretDataAttr?: string;
}

export function TotpSetupDisplay({
  copyTextLabel,
  loadingText,
  onCopy,
  qrCode,
  qrCodeAltText,
  qrCodeDataAttr,
  secretCode,
  secretDataAttr,
}: TotpSetupDisplayProps): React.JSX.Element {
  return (
    <>
      {qrCode ? (
        <img
          {...getDataAttr(qrCodeDataAttr)}
          alt={qrCodeAltText}
          height="228"
          src={qrCode}
          width="228"
        />
      ) : (
        <p>{loadingText}</p>
      )}
      <Flex data-amplify-copy>
        <div {...getDataAttr(secretDataAttr)}>{secretCode}</div>
        {onCopy ? (
          <Flex data-amplify-copy-svg onClick={onCopy}>
            <div data-amplify-copy-tooltip>{copyTextLabel}</div>
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM15 5H8C6.9 5 6.01 5.9 6.01 7L6 21C6 22.1 6.89 23 7.99 23H19C20.1 23 21 22.1 21 21V11L15 5ZM8 21V7H14V12H19V21H8Z" />
            </svg>
          </Flex>
        ) : null}
      </Flex>
    </>
  );
}
