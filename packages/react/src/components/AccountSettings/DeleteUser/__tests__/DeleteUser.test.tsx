import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

import { AuthServiceProvider } from '@saasontools/amplify-ui-react-core';

import {
  Button,
  ButtonProps,
  Flex,
  Heading,
  Text,
} from '../../../../primitives';
import { ComponentClassName } from '../../constants';
import { DeleteUserComponents, WarningViewProps } from '../types';
import DeleteUser from '../DeleteUser';
import { defaultDeleteUserDisplayText } from '../../utils';

jest.mock('../../../../internal', () => ({
  useAuth: () => ({
    user: {},
    isLoading: false,
  }),
}));

const deleteUserSpy = jest.fn();

const renderWithAuthService = (ui: React.ReactElement) =>
  render(
    <AuthServiceProvider value={{ deleteUser: deleteUserSpy }}>
      {ui}
    </AuthServiceProvider>
  );

const { cancelButtonText, deleteAccountButtonText, confirmDeleteButtonText } =
  defaultDeleteUserDisplayText;

function CustomWarningView({ onCancel, onConfirm }: WarningViewProps) {
  return (
    <Flex direction="column">
      <Text variation="warning">Custom Warning Message</Text>
      <Button onClick={onCancel}>Back</Button>
      <Button variation="primary" onClick={onConfirm}>
        Custom Confirm Button
      </Button>
    </Flex>
  );
}

const CustomDeleteButton = ({ onClick, isDisabled }: ButtonProps) => {
  return (
    <Button isDisabled={isDisabled} onClick={onClick}>
      Custom Delete Button
    </Button>
  );
};

const CustomErrorMessage = ({ children }) => (
  <>
    <Heading>Custom Error Message</Heading>
    <Text>{children}</Text>
  </>
);

const components: DeleteUserComponents = {
  DeleteButton: CustomDeleteButton,
  WarningView: CustomWarningView,
  ErrorMessage: CustomErrorMessage,
};

describe('DeleteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    const { container } = renderWithAuthService(<DeleteUser />);
    expect(container).toMatchSnapshot();

    const deleteUser = container.getElementsByClassName(
      ComponentClassName.DeleteUser
    );
    expect(deleteUser).toHaveLength(1);
  });

  it('calls deleteUser with expected arguments', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    renderWithAuthService(<DeleteUser onSuccess={onSuccess} />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: deleteAccountButtonText,
    });

    fireEvent.click(deleteAccountButton);

    await act(async () => {
      const confirmDeleteButton = await screen.findByRole('button', {
        name: confirmDeleteButtonText,
      });

      fireEvent.click(confirmDeleteButton);
    });

    expect(deleteUserSpy).toHaveBeenCalledTimes(1);
  });

  it('onSuccess is called after successful account deletion', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    renderWithAuthService(<DeleteUser onSuccess={onSuccess} />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: deleteAccountButtonText,
    });

    fireEvent.click(deleteAccountButton);

    const confirmDeleteButton = await screen.findByRole('button', {
      name: confirmDeleteButtonText,
    });

    fireEvent.click(confirmDeleteButton);

    // submit handling is async, wait for onSuccess to be called
    // https://testing-library.com/docs/dom-testing-library/api-async/#waitfor
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('onError is called after unsuccessful submit', async () => {
    deleteUserSpy.mockRejectedValue(new Error('Mock Error'));

    const onError = jest.fn();
    renderWithAuthService(<DeleteUser onError={onError} />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: deleteAccountButtonText,
    });

    fireEvent.click(deleteAccountButton);

    const confirmDeleteButton = await screen.findByRole('button', {
      name: confirmDeleteButtonText,
    });

    fireEvent.click(confirmDeleteButton);

    // submit handling is async, wait for onError to be called
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });

  it('hides warning component if cancel is clicked', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    renderWithAuthService(<DeleteUser />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: deleteAccountButtonText,
    });
    fireEvent.click(deleteAccountButton);

    // warning window now should be visible
    await screen.findByText(confirmDeleteButtonText);

    const cancelButton = await screen.findByRole('button', {
      name: cancelButtonText,
    });
    fireEvent.click(cancelButton);

    // warning window should be gone now
    await waitFor(() =>
      expect(
        screen.queryByText(confirmDeleteButtonText)
      ).not.toBeInTheDocument()
    );
  });

  it('error message is displayed after unsuccessful submit', async () => {
    deleteUserSpy.mockRejectedValue(new Error('Mock Error'));

    const onError = jest.fn();
    renderWithAuthService(<DeleteUser onError={onError} />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: deleteAccountButtonText,
    });

    fireEvent.click(deleteAccountButton);

    const confirmDeleteButton = await screen.findByRole('button', {
      name: confirmDeleteButtonText,
    });

    fireEvent.click(confirmDeleteButton);

    expect(await screen.findByText('Mock Error')).toBeDefined();
  });

  it('renders as expected with components overrides', async () => {
    const { container } = renderWithAuthService(
      <DeleteUser components={components} />
    );

    const submitButton = await screen.findByRole('button', {
      name: 'Custom Delete Button',
    });

    expect(submitButton).toBeDefined();
    expect(container).toMatchSnapshot();

    fireEvent.click(submitButton);

    expect(await screen.findByText('Custom Warning Message')).toBeDefined();
  });

  it('onSuccess is called with component overrides after successful user deletion', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    renderWithAuthService(
      <DeleteUser components={components} onSuccess={onSuccess} />
    );

    const deleteAccountButton = await screen.findByRole('button', {
      name: 'Custom Delete Button',
    });
    fireEvent.click(deleteAccountButton);

    await act(async () => {
      const confirmDeleteButton = await screen.findByRole('button', {
        name: 'Custom Confirm Button',
      });

      fireEvent.click(confirmDeleteButton);
    });

    // submit handling is async, wait for onSuccess to be called
    // https://testing-library.com/docs/dom-testing-library/api-async/#waitfor
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('calls deleteUser with expected arguments and component overrides', async () => {
    deleteUserSpy.mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    renderWithAuthService(
      <DeleteUser components={components} onSuccess={onSuccess} />
    );

    const deleteAccountButton = await screen.findByRole('button', {
      name: 'Custom Delete Button',
    });
    fireEvent.click(deleteAccountButton);

    await act(async () => {
      const confirmDeleteButton = await screen.findByRole('button', {
        name: 'Custom Confirm Button',
      });

      fireEvent.click(confirmDeleteButton);
    });

    expect(deleteUserSpy).toHaveBeenCalledWith();
    expect(deleteUserSpy).toHaveBeenCalledTimes(1);
  });

  it('error message is displayed with component overrides after unsuccessful submit', async () => {
    deleteUserSpy.mockRejectedValue(new Error('Mock Error'));

    renderWithAuthService(<DeleteUser components={components} />);

    const deleteAccountButton = await screen.findByRole('button', {
      name: 'Custom Delete Button',
    });
    fireEvent.click(deleteAccountButton);
    await act(async () => {
      const confirmDeleteButton = await screen.findByRole('button', {
        name: 'Custom Confirm Button',
      });

      fireEvent.click(confirmDeleteButton);
    });
    await screen.findByText('Mock Error');

    expect(await screen.findByText('Custom Error Message')).toBeDefined();
  });

  it('renders as expected with override display text', () => {
    const deleteAccountButtonTextOverride = 'Custom delete account label';
    const displayTextOverride = {
      deleteAccountButtonText: deleteAccountButtonTextOverride,
    };
    const { getByText, queryByText } = renderWithAuthService(
      <DeleteUser displayText={displayTextOverride} />
    );
    expect(getByText(deleteAccountButtonTextOverride)).toBeVisible();
    expect(queryByText(deleteAccountButtonText)).toBe(null);
  });
});
