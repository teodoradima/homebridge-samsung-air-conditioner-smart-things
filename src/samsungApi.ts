import Axios from 'axios';

const AC_DEVICE_NAME = '[room a/c] Samsung';

const HOST = 'https://api.smartthings.com/v1/devices';
export class SamsungAPI {
  static setToken(token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  static async getDevices(token) {
    const { data: { items = [] } = {} } = await Axios.get('${HOST}', this.setToken(token));

    return items.filter(item => item.name === AC_DEVICE_NAME);
  }

  static async getDeviceStatus(deviceId, token) {
    const response = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/switch/status`, this.setToken(token));
    return response.data.switch.value;
  }

  static async setDeviceStatus(deviceId, status, token) {
    const data = {
      'commands' : [{'capability': 'switch', 'command': status}],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getDeviceTemperature(deviceId, token) {
    const {
      data: { temperature = { } } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/temperatureMeasurement/status`, this.setToken(token));
    return temperature.value;
  }

  static async getDeviceMode(deviceId, token) {
    const {
      data: { airConditionerMode = { } } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/airConditionerMode/status`, this.setToken(token));
    return airConditionerMode.value;
  }

  static async setDeviceMode(deviceId, mode, token) {
    const data = {
      'commands' : [{'capability': 'airConditionerMode', 'command': 'setAirConditionerMode', 'argument': [mode]}],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getDesiredTemperature(deviceId, token) {
    const {
      data: { coolingSetpoint = { } } = {},
    } = await Axios.get(`${HOST}/${deviceId}/components/main/capabilities/thermostatCoolingSetpoint/status`, this.setToken(token));
    return coolingSetpoint.value;
  }

  static async setDesiredTemperature(deviceId, temperature, token) {
    const data = {
      'commands' : [{'capability': 'thermostatCoolingSetpoint', 'command': 'setCoolingSetpoint', 'argument': [temperature]}],
    };

    await Axios.post(`${HOST}/${deviceId}/commands`, data, this.setToken(token));
  }
}