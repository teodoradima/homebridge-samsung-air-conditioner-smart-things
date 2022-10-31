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
    this.log.info('Finished initializing platform:');

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  discoverDevices() {
    SamsungAPI.getDevices({ config: this.config, logger: this.log }).then(samsungDevices => {
      for (const device of samsungDevices) {
        const uuid = this.api.hap.uuid.generate(device.deviceId.toString());

        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

        if (existingAccessory) {
          this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
          existingAccessory.context.token = this.config.token;
          existingAccessory.context.temperatureUnit = this.config.temperatureUnit;

          new SamsungACPlatformAccessory(this, existingAccessory);
        } else {
          this.log.info('Adding new accessory:', device.label);

          const accessory = new this.api.platformAccessory(device.label, uuid);

          accessory.context.device = device;
          accessory.context.token = this.config.token;
          accessory.context.temperatureUnit = this.config.temperatureUnit;

          new SamsungACPlatformAccessory(this, accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      }
    });
  }
}
