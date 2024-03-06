import config from '../../src/config';
import mongoose from 'mongoose';
import { ProviderManager } from '../../src/scanner/provider-manager';
import { chainManagerProvider } from '../../src/scanner/chain-manager-provider';
import { ChainConfigurationModel } from '../../src/model/chain-configuration';
import { EventModel } from '../../src/model/event';
import { feeCollectorScan } from '../../src/cron/fee-collector-scanner';

const blockRanges = {
  NO_EVENTS_EMITTED: {
    start: 54315353,
    end: 54315458,
  },
  /*
   * https://polygonscan.com/tx/0x5467ea124805a1ca155b680e051edb96cbaf263dfbe20e11e273db7ff85e25d0
   * https://polygonscan.com/tx/0xbc70d0917c8130afab7a8a24126b9cd0f096f70fe9baf689e3f1a44ac6953c92
   * */
  EVENTS_EMITTED: {
    start: 54315351,
    end: 54315459,
  },
};
describe('FeeCollectorScan', () => {
  let globalConfig;

  beforeAll(async () => {
    globalConfig = config.getGlobalConfig();
    await mongoose.connect(globalConfig.mongoUri);

    ProviderManager.Init();
    chainManagerProvider.init();
  });
  afterEach(async () => {
    await Promise.all([
      ChainConfigurationModel.deleteMany({}),
      EventModel.deleteMany({}),
    ]);
  });
  afterAll(async () => {
    await mongoose.connection.close(true);
  });

  describe('Existing events', () => {
    beforeEach(async () => {
      await ChainConfigurationModel.create({
        chainId: 137,
        contracts: [
          {
            address: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
            label: 'FeeCollector',
            lastSynchronizedBlock: blockRanges.EVENTS_EMITTED.start,
          },
        ],
      });
    });
    it('Should find events', async () => {
      await feeCollectorScan(blockRanges.EVENTS_EMITTED.end);

      const numberOfEvents = await EventModel.countDocuments();

      expect(numberOfEvents).toEqual(2);

      const [eventBlock54315459, eventblock54315352] = await Promise.all([
        EventModel.findOne({
          integrator: '0x1ac3ef0ecf4e0ed23d62cab448f3169064230624',
          token: '0x0000000000000000000000000000000000000000',
          integratorFee: '42500000000000',
          lifiFee: '7500000000000',
        }),
        EventModel.findOne({
          integrator: '0xbb59e1ad8607f2131a9ca41673150303a2641259',
          token: '0x871531a59ef89c5262bcf58a80ab29f9711ea5a7',
          integratorFee: '51000000000000000000',
          lifiFee: '9000000000000000000',
        }),
      ]);

      expect(eventblock54315352).toBeTruthy();
      expect(eventBlock54315459).toBeTruthy();
    });
  });
  describe('Not existing events', () => {
    beforeEach(async () => {
      await ChainConfigurationModel.create({
        chainId: 137,
        contracts: [
          {
            address: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
            label: 'FeeCollector',
            lastSynchronizedBlock: blockRanges.NO_EVENTS_EMITTED.start,
          },
        ],
      });
    });
    it('Should not find any events', async () => {
      await feeCollectorScan(blockRanges.NO_EVENTS_EMITTED.end);

      const numberOfEvents = await EventModel.countDocuments();

      expect(numberOfEvents).toEqual(0);
    });
  });
});
