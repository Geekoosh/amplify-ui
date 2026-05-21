import React from 'react';
import type { AuthenticatorMachineOptions } from '@aws-amplify/ui';

import type { UseAuthenticatorSelector } from '../useAuthenticator';
import { useAuthenticator } from '../useAuthenticator';
import { useAuthService } from '../../../AuthService';

// only select `route` from machine context
export const routeSelector: UseAuthenticatorSelector = ({ route }) => [route];

export default function useAuthenticatorInitMachine(
  data: AuthenticatorMachineOptions
): void {
  const { route, initializeMachine } = useAuthenticator(routeSelector);
  const authService = useAuthService();
  const dataWithServices = React.useMemo(
    () => ({ ...data, services: { ...authService, ...data.services } }),
    [authService, data]
  );

  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (!hasInitialized.current && route === 'setup') {
      initializeMachine(dataWithServices);

      hasInitialized.current = true;
    }
  }, [initializeMachine, route, dataWithServices]);
}
