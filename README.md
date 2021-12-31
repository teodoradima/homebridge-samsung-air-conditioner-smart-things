# homebridge-samsung-air-conditioner-smart-things

Homebridge plugin for controlling Samsung Air Conditioner using the [smartthings api](https://smartthings.developer.samsung.com/docs/api-ref/st-api.html#tag/Devices). This setup doesn't require a smartthings hub, but all the interactions with the devices are done through the api, not on your local network.

## Installation 
1. Install [Homebridge](https://github.com/nfarina/homebridge).
2. Install this plugin by running `npm install -g homebridge-samsung-air-conditioner-smart-things`.
3. Setup your Air conditioner devices in the smartthings app.
4. Login and generate a new [token](https://account.smartthings.com/tokens#) for the smartthings api. 
     - Make sure you select all scopes in the devices section.
     - Make sure you can see the devices you want to use for the current user, in the ["My Devices" tab](https://account.smartthings.com/).
5. Copy the token and paste it in the token property of the plugin (config.json).

## Optional Settings

- In case your smartthings account returns the temperature in Fahrenheit, set the Temperature unit config property to F and also make sure that your device in HomeKit is also set to Fahrenheit. Otherwise leave the default value for Temperature unit.
- Enable showing the humidity value if desired: The value will be shown as 0% as long as the device is turned off or just started. This is a limitation of the smartthings api.
- If your Air conditioners support the WindFree option, enable the `windFreeSupported` option (config.json). This allows you to enable the WindFree mode through the "oscillation" settings of the _fan_ while the normal oscillation (fixed vs all directions) is available through the Air conditioner in Apple Home. This changes makes it easier to enable the WindFree mode if the fan and Air conditioner settings are grouped in Apple Home (which is the default if added through Homebridge).

## Features
- Import all AC devices in your smartthings account
- Turning AC on and off
- Getting and setting target temperature
- Getting current temperature
- Getting and setting AC mode
- Turning the fan on and off
- Getting and setting fan operation mode (manual / automatic)
- Getting and setting rotation speed of the fan 
  - A target fan speed of automatic will report with a rotation speed of 0% as the actual rotation speed cannot be determined.
- Getting and setting oscillation mode
- Getting and setting WindFree mode (if supported)
- Getting current humidity (if enabled)
