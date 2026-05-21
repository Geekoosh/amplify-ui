import { createMachine, sendUpdate } from 'xstate';
import type {
  ConfirmUserAttributeInput,
  SendUserAttributeVerificationCodeInput,
} from 'aws-amplify/auth';

import { runValidators } from '../../../validators';

import type { AuthContext, AuthEvent, VerifyUserContext } from '../types';
import actions from '../actions';
import { defaultServices } from '../defaultServices';

export type VerifyUserAttributesMachineOptions = {
  services?: AuthContext['services'];
};

export function verifyUserAttributesActor({
  services,
}: VerifyUserAttributesMachineOptions = {}) {
  const actorServices = { ...defaultServices, ...services };

  return createMachine<VerifyUserContext, AuthEvent>(
    {
      id: 'verifyUserAttributesActor',
      initial: 'selectUserAttributes',
      predictableActionArguments: true,
      states: {
        selectUserAttributes: {
          initial: 'edit',
          exit: ['clearError', 'clearTouched', 'sendUpdate'],
          states: {
            edit: {
              entry: 'sendUpdate',
              on: {
                SUBMIT: { actions: 'handleSubmit', target: 'submit' },
                SKIP: { target: '#verifyUserAttributesActor.resolved' },
                CHANGE: { actions: 'handleInput' },
              },
            },
            submit: {
              tags: 'pending',
              entry: ['clearError', 'sendUpdate'],
              invoke: {
                src: 'sendUserAttributeVerificationCode',
                onDone: {
                  actions: [
                    'setSelectedUserAttribute',
                    'setCodeDeliveryDetails',
                  ],
                  target:
                    '#verifyUserAttributesActor.confirmVerifyUserAttribute',
                },
                onError: {
                  actions: 'setRemoteError',
                  target: 'edit',
                },
              },
            },
          },
        },
        confirmVerifyUserAttribute: {
          initial: 'edit',
          exit: ['clearError', 'clearFormValues', 'clearTouched'],
          states: {
            edit: {
              entry: 'sendUpdate',
              on: {
                SUBMIT: { actions: 'handleSubmit', target: 'submit' },
                SKIP: '#verifyUserAttributesActor.resolved',
                CHANGE: { actions: 'handleInput' },
              },
            },
            submit: {
              tags: 'pending',
              entry: ['clearError', 'sendUpdate'],
              invoke: {
                src: 'confirmVerifyUserAttribute',
                onDone: {
                  actions: [
                    'setConfirmAttributeCompleteStep',
                    'clearSelectedUserAttribute',
                  ],
                  target: '#verifyUserAttributesActor.resolved',
                },
                onError: {
                  actions: 'setRemoteError',
                  target: 'edit',
                },
              },
            },
          },
        },
        resolved: { type: 'final', data: ({ step }) => ({ step }) },
      },
    },
    {
      // sendUpdate is a HOC
      actions: { ...actions, sendUpdate: sendUpdate() },
      services: {
        sendUserAttributeVerificationCode({ formValues: { unverifiedAttr } }) {
          const input: SendUserAttributeVerificationCodeInput = {
            userAttributeKey:
              unverifiedAttr as SendUserAttributeVerificationCodeInput['userAttributeKey'],
          };
          return actorServices.sendUserAttributeVerificationCode(input);
        },
        async confirmVerifyUserAttribute({
          formValues: { confirmation_code: confirmationCode },
          selectedUserAttribute,
        }) {
          const input: ConfirmUserAttributeInput = {
            confirmationCode,
            userAttributeKey:
              selectedUserAttribute as ConfirmUserAttributeInput['userAttributeKey'],
          };
          return actorServices.confirmUserAttribute(input);
        },
        async validateFields(context) {
          return runValidators(
            context.formValues,
            context.touched,
            context.passwordSettings,
            [
              defaultServices.validateFormPassword,
              defaultServices.validateConfirmPassword,
            ]
          );
        },
      },
    }
  );
}
