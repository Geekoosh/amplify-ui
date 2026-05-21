import { createMachine } from 'xstate';

import { defaultServices } from '../defaultServices';
import type { AuthContext, AuthEvent, SignOutContext } from '../types';

export type SignOutMachineOptions = {
  services?: AuthContext['services'];
};

export const signOutActor = ({ services }: SignOutMachineOptions = {}) => {
  const actorServices = { ...defaultServices, ...services };

  return createMachine<SignOutContext, AuthEvent>(
    {
      initial: 'pending',
      id: 'signOutActor',
      predictableActionArguments: true,
      states: {
        pending: {
          tags: 'pending',
          invoke: {
            src: 'signOut',
            onDone: 'resolved',
            onError: 'rejected',
          },
        },
        resolved: { type: 'final' },
        rejected: { type: 'final' },
      },
    },
    {
      services: {
        signOut: () => actorServices.handleSignOut(),
      },
    }
  );
};
