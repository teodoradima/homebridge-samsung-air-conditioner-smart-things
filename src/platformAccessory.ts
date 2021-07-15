import { Service, PlatformAccessory } from 'homebridge';

import { SamsungAC } from './platform';
import { SamsungAPI } from './samsungApi';

export class SamsungACPlatformAccessory {
  private service: Service;

  private states = {
    On: 'on',
    Off: 'off',
  };

  private deviceMode = {
    Cool: 'cool',
    Heat: 'heat',
    Dry: 'dry',
    Fan: 'wind',
    Auto: 'auto',
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
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.handleActiveSet.bind(this))
      .onGet(this.handleActiveGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
      .onSet(this.handleTargetHeaterCoolerStateSet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    let threshholdProps = {
      minValue: 16,
      maxValue: 30,
      minStep: 1,
    };

    if (this.accessory.context.temperatureUnit === 'F') {
      threshholdProps = {
        minValue: 60,
        maxValue: 86,
        minStep: 1,
      };
    }

    this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
      .setProps(threshholdProps)
      .onSet(this.handleCoolingTemperatureSet.bind(this))
      .onGet(this.handleCoolingTemperatureGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
      .setProps(threshholdProps)
      .onSet(this.handleCoolingTemperatureSet.bind(this))
      .onGet(this.handleCoolingTemperatureGet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Active" characteristic
   */
  async handleActiveGet() {
    // set this to a valid value for Active
    const currentValue = this.platform.Characteristic.Active.INACTIVE;
    const status = await SamsungAPI.getDeviceStatus(this.accessory.context.device.deviceId, this.accessory.context.token);
    return status === this.states.Off ? currentValue : this.platform.Characteristic.Active.ACTIVE;
  }

  /**
   * Handle requests to set the "Active" characteristic
   */
  async handleActiveSet(value) {
    const statusValue = value === 1 ? this.states.On : this.states.Off ;
    await SamsungAPI.setDeviceStatus(this.accessory.context.device.deviceId, statusValue, this.accessory.context.token);
  }

  /**
   * Handle requests to get the current value of the "Current Heater-Cooler State" characteristic
   */
  async handleCurrentHeaterCoolerStateGet() {
    // set this to a valid value for CurrentHeaterCoolerState
    let currentValue = this.platform.Characteristic.CurrentHeaterCoolerState.IDLE;
    const deviceMode = await SamsungAPI.getDeviceMode(this.accessory.context.device.deviceId, this.accessory.context.token);
    switch (deviceMode) {
      case this.deviceMode.Dry:
      case this.deviceMode.Cool: {
        currentValue = this.platform.Characteristic.CurrentHeaterCoolerState.COOLING;
        break;
      }
      case this.deviceMode.Heat: {
        currentValue = this.platform.Characteristic.CurrentHeaterCoolerState.HEATING;
        break;
      }
      case this.deviceMode.Fan: {
        currentValue = this.platform.Characteristic.CurrentHeaterCoolerState.INACTIVE;
        break;
      }
    }

    return currentValue;
  }


  /**
   * Handle requests to get the current value of the "Target Heater-Cooler State" characteristic
   */
  async handleTargetHeaterCoolerStateGet() {
    // set this to a valid value for TargetHeaterCoolerState
    let currentValue = this.platform.Characteristic.TargetHeaterCoolerState.AUTO;
    const deviceMode = await SamsungAPI.getDeviceMode(this.accessory.context.device.deviceId, this.accessory.context.token);
    switch (deviceMode) {
      case this.deviceMode.Dry:
      case this.deviceMode.Cool: {
        currentValue = this.platform.Characteristic.TargetHeaterCoolerState.COOL;
        break;
      }
      case this.deviceMode.Heat: {
        currentValue = this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
        break;
      }
    }

    return currentValue;
  }

  /**
   * Handle requests to set the "Target Heater-Cooler State" characteristic
   */
  async handleTargetHeaterCoolerStateSet(value) {
    let modeValue = this.deviceMode.Auto;
    switch (value) {
      case this.platform.Characteristic.TargetHeaterCoolerState.COOL: {
        modeValue = this.deviceMode.Cool;
        break;
      }
      case this.platform.Characteristic.TargetHeaterCoolerState.HEAT: {
        modeValue = this.deviceMode.Heat;
        break;
      }
    }

    await SamsungAPI.setDeviceMode(this.accessory.context.device.deviceId, modeValue, this.accessory.context.token);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet() {
    // set this to a valid value for CurrentTemperature
    let temperature = await SamsungAPI.getDeviceTemperature(this.accessory.context.device.deviceId, this.accessory.context.token);
    if (this.accessory.context.temperatureUnit === 'F') {
      temperature = this.toCelsius(temperature);
    }

    return temperature;
  }

  async handleCoolingTemperatureGet() {
    // get value for DesiredTemperature
    let temperature = await SamsungAPI.getDesiredTemperature(this.accessory.context.device.deviceId, this.accessory.context.token);
    if (this.accessory.context.temperatureUnit === 'F') {
      temperature = this.toCelsius(temperature);
    }

    return temperature;
  }

  async handleCoolingTemperatureSet(temp) {
    // set this to a valid value for DesiredTemperature
    await SamsungAPI.setDesiredTemperature(this.accessory.context.device.deviceId, temp, this.accessory.context.token);
  }

  private toCelsius(fTemperature) {
    return (5/9) * (fTemperature - 32);
  }
}
