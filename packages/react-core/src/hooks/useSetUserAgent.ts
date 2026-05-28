import { useEffect } from 'react';
import type { SetUserAgentOptions } from '@saasontools/amplify-ui';
import { setUserAgent } from '@saasontools/amplify-ui';

export default function useSetUserAgent({
  componentName,
  packageName,
  version,
}: SetUserAgentOptions): void {
  useEffect(() => {
    const clearUserAgent = setUserAgent({
      componentName,
      packageName,
      version,
    });

    return clearUserAgent;
  }, [componentName, packageName, version]);
}
