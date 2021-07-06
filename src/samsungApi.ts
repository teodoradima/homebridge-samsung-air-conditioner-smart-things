import Axios from 'axios';

const AC_DEVICE_NAME = '[room a/c] Samsung';

export class SamsungAPI {
  static setToken(token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  static async getDevices(token) {
    const { data: { items = [] } = {} } = await Axios.get('https://api.smartthings.com/v1/devices', this.setToken(token));

    return items.filter(item => item.name === AC_DEVICE_NAME);
  }

  static async getDeviceStatus(deviceId, token) {
    const response = await Axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/components/main/capabilities/switch/status`, this.setToken(token));
    return response.data.switch.value;
  }

  static async setDeviceStatus(deviceId, status, token) {
    let data = {
      "commands" : [{"capability": "switch", "command": status}]
    };

    await Axios.post(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, data, this.setToken(token));
  }

  static async getDeviceTemperature(deviceId, token) {
    const { data: { temperature = { } } = {} } = await Axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/components/main/capabilities/temperatureMeasurement/status`, this.setToken(token));
    return temperature.value;
  }
}