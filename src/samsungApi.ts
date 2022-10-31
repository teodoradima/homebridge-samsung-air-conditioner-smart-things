import Axios from 'axios';
import { Logger, PlatformConfig } from 'homebridge';
import { inspect } from 'util';

const TYPE_TESTER = /Samsung(\sOCF)? Air Conditioner/i;
const HOST = 'https://api.smartthings.com/v1/devices';

export interface PluginContext {
  logger: Logger;
  config: PlatformConfig;
}

export interface SamsungDevice {
  deviceId: string;
  label: string;
  deviceTypeName;
}

// Samsung API documentation: https://developer-preview.smartthings.com/docs/devices/capabilities/capabilities-reference/
export class SamsungAPI {

  static setToken(token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  static async getDevices(context: PluginContext): Promise<SamsungDevice[]> {
    const { data = {} } = await Axios.get(`${HOST}`, this.setToken(context.config.token));
    const items: SamsungDevice[] = data.items || [];
    context.logger.info(`Found ${items.length} devices from Samsung. Checking for A/C devices...`);
    context.logger.debug('Discovered Devices:', inspect(items));

    const itemNames = (itemList: SamsungDevice[]) => itemList.map(i => `'${i.label}'`).join(', ');

    const acDevices = items.filter(item => TYPE_TESTER.test(item.deviceTypeName) || item.label === context.config.deviceName);
    if (acDevices.length === 0) {
      context.logger.error(`Could not find any A/C devices out of ${items.length} total devices found.` +
        `Use deviceName in config to specify the name of your device. Names found: ${itemNames(items)}`);
    } else {
      context.logger.info(`Found ${acDevices.length} A/C devices: ${itemNames(acDevices)}`);
    }

    return acDevices;
  }

  static async getDeviceStatus(deviceId, token) {
    const response = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/switch/status`, this.setToken(token));
    return response.data.switch.value;
  }

  static async setDeviceStatus(deviceId, status, token) {
    // possible values: 'on', 'off'
    const data = {
      'commands': [{ 'capability': 'switch', 'command': status }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getDeviceTemperature(deviceId, token) {
    const {
      data: { temperature = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/temperatureMeasurement/status`, this.setToken(token));
    return temperature.value;
  }

  static async getDeviceHumidity(deviceId, token) {
    const {
      data: { humidity = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/relativeHumidityMeasurement/status`, this.setToken(token));
    return humidity.value;
  }

  static async getDeviceMode(deviceId, token) {
    const {
      data: { airConditionerMode = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/airConditionerMode/status`, this.setToken(token));
    return airConditionerMode.value;
  }

  static async setDeviceMode(deviceId, mode, token) {
    // possible modes: 'auto', 'dry', 'cool', 'heat', 'wind'
    const data = {
      'commands': [{ 'capability': 'airConditionerMode', 'command': 'setAirConditionerMode', 'arguments': [mode] }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getFanMode(deviceId, token) {
    const {
      data: { fanMode = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/airConditionerFanMode/status`, this.setToken(token));
    return fanMode.value;
  }

  static async setFanMode(deviceId, mode, token) {
    // possible values: 'auto', 'low', 'medium', 'high', 'turbo'
    const data = {
      'commands': [{ 'capability': 'airConditionerFanMode', 'command': 'setFanMode', 'arguments': [mode] }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getFanOscillationMode(deviceId, token) {
    const {
      data: { fanOscillationMode = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/fanOscillationMode/status`, this.setToken(token));
    return fanOscillationMode.value;
  }

  static async setFanOscillationMode(deviceId, mode, token) {
    // possible values: 'all', 'fixed', 'vertical', 'horizontal', 'indirect', 'direct', 'fixedCenter', 'fixedLeft', 'fixedRight', 'far'
    const data = {
      'commands': [{ 'capability': 'fanOscillationMode', 'command': 'setFanOscillationMode', 'arguments': [mode] }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getWindFreeMode(deviceId, token) {
    const {
      data: { acOptionalMode = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/custom.airConditionerOptionalMode/status`, this.setToken(token));
    return acOptionalMode.value;
  }

  static async setWindFreeMode(deviceId, mode, token) {
    // possible values: 'off', 'windFree'
    const data = {
      'commands': [{ 'capability': 'custom.airConditionerOptionalMode', 'command': 'setAcOptionalMode', 'arguments': [mode] }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getDesiredTemperature(deviceId, token) {
    const {
      data: { coolingSetpoint = {} } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/thermostatCoolingSetpoint/status`, this.setToken(token));
    return coolingSetpoint.value;
  }

  static async setDesiredTemperature(deviceId, temperature, token) {
    // data type: integer
    const data = {
      'commands': [{ 'capability': 'thermostatCoolingSetpoint', 'command': 'setCoolingSetpoint', 'arguments': [temperature] }],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }
}
