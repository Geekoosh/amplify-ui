import type { ReactNode } from 'react';
import React from 'react';

import type { AuthServices } from '@saasontools/amplify-ui';
import { defaultServices } from '@saasontools/amplify-ui';

export type AuthServiceContextValue = Partial<AuthServices>;

const AuthServiceContext =
  React.createContext<AuthServiceContextValue>(defaultServices);

export function AuthServiceProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: AuthServiceContextValue;
}): React.JSX.Element {
  const parentValue = React.useContext(AuthServiceContext);

  const resolvedValue = React.useMemo(
    () => ({ ...defaultServices, ...parentValue, ...value }),
    [parentValue, value]
  );

  return (
    <AuthServiceContext.Provider value={resolvedValue}>
      {children}
    </AuthServiceContext.Provider>
  );
}

export function useAuthService(): AuthServices {
  return React.useContext(AuthServiceContext) as AuthServices;
}
