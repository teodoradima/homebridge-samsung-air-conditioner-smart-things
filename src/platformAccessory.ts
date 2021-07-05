import { Service, PlatformAccessory } from 'homebridge';

import { SamsungAC } from './platform';


export class SamsungACPlatformAccessory {
  private service: Service;

  private states = {
    On: 'on',
    Off: 'off',
  };

  constructor(
    private readonly platform: SamsungAC,
    private readonly accessory: PlatformAccessory,
    // public readonly log: Logger,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.manufacturerName)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.deviceTypeName)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.deviceId);

    this.service = this.accessory.getService(this.platform.Service.HeaterCooler)
      || this.accessory.addService(this.platform.Service.HeaterCooler);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.handleActiveSet.bind(this))
      .onGet(this.handleActiveGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
      .onSet(this.handleTargetHeaterCoolerStateSet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Active" characteristic
   */
  handleActiveGet() {
    // set this to a valid value for Active
    const currentValue = this.platform.Characteristic.Active.INACTIVE;

    return currentValue;
  }

  /**
   * Handle requests to set the "Active" characteristic
   */
  handleActiveSet(value) {
    // do something
  }

  /**
   * Handle requests to get the current value of the "Current Heater-Cooler State" characteristic
   */
  handleCurrentHeaterCoolerStateGet() {
    // set this to a valid value for CurrentHeaterCoolerState
    const currentValue = this.platform.Characteristic.CurrentHeaterCoolerState.INACTIVE;

    return currentValue;
  }


  /**
   * Handle requests to get the current value of the "Target Heater-Cooler State" characteristic
   */
  handleTargetHeaterCoolerStateGet() {
    // set this to a valid value for TargetHeaterCoolerState
    const currentValue = this.platform.Characteristic.TargetHeaterCoolerState.AUTO;

    return currentValue;
  }

  /**
   * Handle requests to set the "Target Heater-Cooler State" characteristic
   */
  handleTargetHeaterCoolerStateSet(value) {
    // do something
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet() {
    // set this to a valid value for CurrentTemperature
    const currentValue = -270;

    return currentValue;
  }
}
