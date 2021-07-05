import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SamsungACPlatformAccessory } from './platformAccessory';

import { SamsungAPI } from './samsungApi';

export class SamsungAC implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', async () => {
      log.debug('Executed didFinishLaunching callback');
      await this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const samsungDevices = await SamsungAPI.getDevices('ef7a9c71-ef1a-4864-8bc9-7265b5deb355');

    for (const device of samsungDevices) {
      const uuid = this.api.hap.uuid.generate(device.deviceId);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        new SamsungACPlatformAccessory(this, existingAccessory, this.log);
      } else {
        this.log.info('Adding new accessory:', device.label);

        const accessory = new this.api.platformAccessory(device.label, uuid);

        accessory.context.device = device;

        new SamsungACPlatformAccessory(this, accessory, this.log);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
