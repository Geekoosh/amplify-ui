import { createAmplifyLogger } from '../../machines/authenticator/amplifyAuthAdapter';
import { getLogger } from '../utils';

jest.mock('../../machines/authenticator/amplifyAuthAdapter', () => ({
  createAmplifyLogger: jest.fn(),
}));

const createAmplifyLoggerMock = jest.mocked(createAmplifyLogger);

describe('getLogger', () => {
  beforeEach(() => {
    createAmplifyLoggerMock.mockReset();
  });

  it('should create a category logger', () => {
    const logger = { debug: jest.fn() };
    createAmplifyLoggerMock.mockReturnValue(
      logger as unknown as ReturnType<typeof createAmplifyLogger>
    );

    expect(getLogger('Auth')).toBe(logger);
    expect(createAmplifyLoggerMock).toHaveBeenCalledWith('AmplifyUI:Auth');
  });

  it('should create a scoped category logger', () => {
    const logger = { debug: jest.fn() };
    createAmplifyLoggerMock.mockReturnValue(
      logger as unknown as ReturnType<typeof createAmplifyLogger>
    );

    expect(getLogger('Auth', 'SetupTotp')).toBe(logger);
    expect(createAmplifyLoggerMock).toHaveBeenCalledWith(
      'AmplifyUI:Auth:SetupTotp'
    );
  });
});
