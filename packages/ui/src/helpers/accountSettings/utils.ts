import { amplifyAuthAdapter } from '../../machines/authenticator/amplifyAuthAdapter';
import { getLogger } from '../utils';

const logger = getLogger('Auth');

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordInput): Promise<void> => {
  try {
    logger.debug('calling Auth.changePassword');
    await amplifyAuthAdapter.changePassword({
      currentPassword,
      newPassword,
    });
    logger.debug('Auth.changePassword was successful');
    return Promise.resolve();
  } catch (e) {
    logger.debug('Auth.changePassword failed with error', e);
    return Promise.reject(e);
  }
};

export const deleteUser = async () => {
  try {
    logger.debug('calling Auth.deleteUser');
    await amplifyAuthAdapter.deleteUser();
    logger.debug('Auth.deleteUser was successful');
    return Promise.resolve();
  } catch (e) {
    logger.debug('Auth.deleteUser failed with error', e);
    return Promise.reject(e);
  }
};
