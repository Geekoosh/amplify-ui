import {
  deleteAuthUser,
  updatePassword,
} from '../../../machines/authenticator/amplifyAuthAdapter';
import { changePassword, deleteUser } from '../utils';

jest.mock('../../../machines/authenticator/amplifyAuthAdapter', () => ({
  createAmplifyLogger: () => ({ debug: jest.fn() }),
  deleteAuthUser: jest.fn(),
  updatePassword: jest.fn(),
}));

const updatePasswordSpy = jest.mocked(updatePassword);
const deleteAuthUserSpy = jest.mocked(deleteAuthUser);

describe('changePassword', () => {
  const currentPassword = 'oldpassword';
  const newPassword = 'newpassword';

  it('should resolve if Auth.updatePassword is successful', async () => {
    updatePasswordSpy.mockResolvedValue(undefined);

    await expect(
      changePassword({ currentPassword, newPassword })
    ).resolves.toBeUndefined();

    expect(updatePasswordSpy).toHaveBeenCalledWith({
      oldPassword: currentPassword,
      newPassword,
    });
  });

  it('should reject with error if Auth.updatePassword fails', async () => {
    const error = new Error('change password failed');
    updatePasswordSpy.mockRejectedValue(error);

    await expect(
      changePassword({ currentPassword, newPassword })
    ).rejects.toEqual(error);

    expect(updatePasswordSpy).toHaveBeenCalledWith({
      oldPassword: currentPassword,
      newPassword,
    });
  });
});

describe('deleteUser', () => {
  it('should resolve if Auth.deleteUser is successful', async () => {
    deleteAuthUserSpy.mockResolvedValue(undefined);

    await expect(deleteUser()).resolves.toBeUndefined();

    expect(deleteAuthUserSpy).toHaveBeenCalled();
  });

  it('should reject with error if Auth.deleteUser fails', async () => {
    const error = new Error('delete user failed');
    deleteAuthUserSpy.mockRejectedValue(error);

    await expect(deleteUser()).rejects.toEqual(error);

    expect(deleteAuthUserSpy).toHaveBeenCalled();
  });
});
