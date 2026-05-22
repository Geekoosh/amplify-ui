import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

let mockAuthService: Record<string, jest.Mock>;

jest.mock('@aws-amplify/ui-react-core', () => ({
  useAuthService: () => mockAuthService,
  useSetUserAgent: jest.fn(),
}));
jest.mock('../../../../internal', () => ({
  useAuth: () => ({
    user: { username: 'username' },
    isLoading: false,
  }),
}));

const ManagePasskeys = require('../ManagePasskeys').default;

const associateWebAuthnCredential = jest.fn();
const deleteWebAuthnCredential = jest.fn();
const listWebAuthnCredentials = jest.fn();

describe('ManagePasskeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    associateWebAuthnCredential.mockResolvedValue(undefined);
    deleteWebAuthnCredential.mockResolvedValue(undefined);
    listWebAuthnCredentials.mockResolvedValue({
      credentials: [
        {
          credentialId: 'credential-id',
          friendlyCredentialName: 'My Phone',
        },
      ],
    });
    mockAuthService = {
      associateWebAuthnCredential,
      deleteWebAuthnCredential,
      listWebAuthnCredentials,
    };
  });

  it('lists passkeys with an injected service', async () => {
    render(<ManagePasskeys />);

    expect(await screen.findByText('My Phone')).toBeInTheDocument();
    expect(listWebAuthnCredentials).toHaveBeenCalledTimes(1);
  });

  it('registers a passkey with an injected service', async () => {
    const onSuccess = jest.fn();
    render(<ManagePasskeys onSuccess={onSuccess} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Register passkey' })
    );

    await waitFor(() => {
      expect(associateWebAuthnCredential).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('deletes a passkey with an injected service', async () => {
    render(<ManagePasskeys />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteWebAuthnCredential).toHaveBeenCalledWith({
        credentialId: 'credential-id',
      });
    });
  });
});
