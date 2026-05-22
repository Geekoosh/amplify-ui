import QRCode from 'qrcode';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('qrcode');
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

const ManageMFA = require('../ManageMFA').default;

const fetchMFAPreference = jest.fn();
const setUpTOTP = jest.fn();
const updateMFAPreference = jest.fn();
const verifyTOTPSetup = jest.fn();
const toDataURL = QRCode.toDataURL as jest.Mock;

const setupDetails = {
  sharedSecret: 'totp-secret',
  getSetupUri: jest.fn(
    () => new URL('otpauth://totp/AWSCognito:username?secret=totp-secret')
  ),
};

describe('ManageMFA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMFAPreference.mockResolvedValue({ enabled: [] });
    setUpTOTP.mockResolvedValue(setupDetails);
    toDataURL.mockResolvedValue('data:image/png;base64,qr');
    updateMFAPreference.mockResolvedValue(undefined);
    verifyTOTPSetup.mockResolvedValue(undefined);
    mockAuthService = {
      fetchMFAPreference,
      setUpTOTP,
      updateMFAPreference,
      verifyTOTPSetup,
    };
  });

  it('sets up and verifies TOTP with injected services', async () => {
    render(<ManageMFA />);

    expect(await screen.findByText('TOTP is not enabled.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Set up TOTP' }));

    expect(await screen.findByText('totp-secret')).toBeInTheDocument();
    expect(
      await screen.findByAltText('TOTP setup QR code')
    ).toBeInTheDocument();
    expect(toDataURL).toHaveBeenCalledWith(
      'otpauth://totp/AWSCognito:username?secret=totp-secret'
    );

    fireEvent.input(screen.getByLabelText('Verification code'), {
      target: { value: '123456' },
    });
    const form = screen.getByLabelText('Verification code').closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(verifyTOTPSetup).toHaveBeenCalledWith({ code: '123456' });
    });
    expect(updateMFAPreference).toHaveBeenCalledWith({ totp: 'PREFERRED' });
  });

  it('updates TOTP preference with an injected service', async () => {
    fetchMFAPreference.mockResolvedValue({ enabled: ['TOTP'] });

    render(<ManageMFA />);

    expect(await screen.findByText('TOTP is enabled.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Disable TOTP' }));

    await waitFor(() => {
      expect(updateMFAPreference).toHaveBeenCalledWith({ totp: 'DISABLED' });
    });
  });
});
