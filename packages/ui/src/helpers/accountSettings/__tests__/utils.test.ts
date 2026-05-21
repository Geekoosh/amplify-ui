import { amplifyAuthAdapter } from '../../../machines/authenticator/amplifyAuthAdapter';
import { changePassword, deleteUser } from '../utils';

// mock `aws-amplify` to prevent logging auth errors during test runs
jest.mock('aws-amplify');

const changePasswordSpy = jest.spyOn(amplifyAuthAdapter, 'changePassword');
const deleteUserSpy = jest.spyOn(amplifyAuthAdapter, 'deleteUser');

describe('changePassword', () => {
  const currentPassword = 'oldpassword';
  const newPassword = 'newpassword';

  it('should resolve if Auth.updatePassword is successful', async () => {
    changePasswordSpy.mockResolvedValue(undefined);

    await expect(
      changePassword({ currentPassword, newPassword })
    ).resolves.toBeUndefined();

    expect(changePasswordSpy).toHaveBeenCalledWith({
      currentPassword,
      newPassword,
    });
  });

  it('should reject with error if Auth.updatePassword fails', async () => {
    const error = new Error('change password failed');
    changePasswordSpy.mockRejectedValue(error);

    await expect(
      changePassword({ currentPassword, newPassword })
    ).rejects.toEqual(error);

    expect(changePasswordSpy).toHaveBeenCalledWith({
      currentPassword,
      newPassword,
    });
  });
});

describe('deleteUser', () => {
  it('should resolve if Auth.deleteUser is successful', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    await expect(deleteUser()).resolves.toBeUndefined();

    expect(deleteUserSpy).toHaveBeenCalled();
  });

  it('should reject with error if Auth.deleteUser fails', async () => {
    const error = new Error('delete user failed');
    deleteUserSpy.mockRejectedValue(error);

    await expect(deleteUser()).rejects.toEqual(error);

    expect(deleteUserSpy).toHaveBeenCalled();
  });
});
