import Axios from 'axios';

const AC_DEVICE_NAME = '[room a/c] Samsung';

export class SamsungAPI {
  static setToken(token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  static async getDevices(token) {
    const { data: { items = [] } = {} } = await Axios.get('https://api.smartthings.com/v1/devices', this.setToken(token));

    return items.map(item => item.name === AC_DEVICE_NAME);
  }
}