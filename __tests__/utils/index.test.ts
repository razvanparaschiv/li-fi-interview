import {
  getEnvOrThrow,
  parseChainIdsEnvironment,
  wrapCronJob,
} from '../../src/utils';
import { EnvironmentError } from '../../src/types/error/environment-error';

describe('parseChainIdsEnvironment', () => {
  afterEach(() => {
    delete process.env.CHAIN_IDS;
  });

  it('parses valid chain IDs correctly', () => {
    process.env.CHAIN_IDS = 'ETH,POLYGON';
    expect(parseChainIdsEnvironment()).toEqual(['ETH', 'POLYGON']);
  });
});

describe('getEnvOrThrow', () => {
  it('throws EnvironmentError when environment variable is undefined', () => {
    expect(() => getEnvOrThrow('MISSING_VAR')).toThrow(EnvironmentError);
  });

  it('returns the environment variable value if set', () => {
    process.env.TEST_VAR = 'test';
    expect(getEnvOrThrow('TEST_VAR')).toBe('test');
  });
});

describe('wrapCronJob', () => {
  const jobName = 'testJob';

  it('should not start the job if it is already running', async () => {
    const mockSetStatus = jest.fn();
    const mockIsRunning = jest.fn().mockReturnValue(true);
    const mockDoJob = jest.fn();

    await wrapCronJob(mockSetStatus, mockIsRunning, jobName, mockDoJob);

    expect(mockDoJob).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      `${jobName} already running. Skipping`,
    );
  });

  it('should set status to true, call doJob, and then set status to false when job is not running', async () => {
    const mockSetStatus = jest.fn();
    const mockIsRunning = jest.fn().mockReturnValue(false);
    const mockDoJob = jest.fn();

    await wrapCronJob(mockSetStatus, mockIsRunning, jobName, mockDoJob);

    expect(mockSetStatus).toHaveBeenCalledWith(true);
    expect(mockDoJob).toHaveBeenCalled();
    expect(mockSetStatus).toHaveBeenCalledWith(false);
    expect(console.log).toHaveBeenCalledWith(`Starting ${jobName}`);
    expect(console.log).toHaveBeenCalledWith(`${jobName} finished`);
  });

  it('should log and rethrow an error if doJob throws', async () => {
    const mockSetStatus = jest.fn();
    const mockIsRunning = jest.fn().mockReturnValue(false);
    const mockDoJob = jest.fn().mockRejectedValue(new Error('Test Error'));

    await expect(
      wrapCronJob(mockSetStatus, mockIsRunning, jobName, mockDoJob),
    ).rejects.toThrow('Test Error');

    expect(console.error).toHaveBeenCalledWith(
      `${jobName} error`,
      expect.any(Error),
    );
    expect(mockSetStatus).toHaveBeenCalledWith(false);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
