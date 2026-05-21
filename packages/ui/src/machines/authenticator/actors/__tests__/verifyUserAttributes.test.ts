import type { VerifyUserContext } from '../../types';
import type { VerifyUserAttributesMachineOptions } from '../verifyUserAttributes';
import { verifyUserAttributesActor } from '../verifyUserAttributes';

const mockSendUserAttributeVerificationCode = jest.fn();
const mockConfirmUserAttribute = jest.fn();

const verifyUserAttributesMachineProps: VerifyUserAttributesMachineOptions = {
  services: {
    sendUserAttributeVerificationCode: mockSendUserAttributeVerificationCode,
    confirmUserAttribute: mockConfirmUserAttribute,
  },
};

type VerifyUserAttributesActorServices = {
  sendUserAttributeVerificationCode(context: VerifyUserContext): unknown;
  confirmVerifyUserAttribute(context: VerifyUserContext): unknown;
};

describe('verifyUserAttributesActor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends verification codes through services', async () => {
    const machine = verifyUserAttributesActor(verifyUserAttributesMachineProps);
    const services = machine.options
      .services as VerifyUserAttributesActorServices;

    await services.sendUserAttributeVerificationCode({
      formValues: { unverifiedAttr: 'email' },
    } as unknown as VerifyUserContext);

    expect(mockSendUserAttributeVerificationCode).toHaveBeenCalledWith({
      userAttributeKey: 'email',
    });
  });

  it('confirms verification codes through services', async () => {
    const machine = verifyUserAttributesActor(verifyUserAttributesMachineProps);
    const services = machine.options
      .services as VerifyUserAttributesActorServices;

    await services.confirmVerifyUserAttribute({
      formValues: { confirmation_code: '123456' },
      selectedUserAttribute: 'phone_number',
    } as unknown as VerifyUserContext);

    expect(mockConfirmUserAttribute).toHaveBeenCalledWith({
      confirmationCode: '123456',
      userAttributeKey: 'phone_number',
    });
  });
});
