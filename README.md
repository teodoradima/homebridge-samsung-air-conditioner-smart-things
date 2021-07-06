# homebridge-samsung-air-conditioner-smart-things

Homebridge plugin for controlling Samsung Air Conditioner using the [smartthings api](https://smartthings.developer.samsung.com/docs/api-ref/st-api.html#tag/Devices). This setup doesn't require a smartthings hub, but all the interactions with the devices are done through the api, not on your local network.

## Installation 
1. Install [Homebridge](https://github.com/nfarina/homebridge).
2. Install this plugin by running `npm install -g homebridge-samsung-air-conditioner-smart-things`.
3. Setup your Air conditioner devices in the smartthings app
4. Login and generate a new [token](https://account.smartthings.com/tokens#) for the smartthings api. 
     - Make sure you select all scopes in the devices section.
     - Make sure you can see the devices you want to use for the current user, in the ["My Devices" tab](https://account.smartthings.com/) 
5. Copy the token and paste it in the token property of the plugin (config.json). 

## Features
- Import all AC devices in your smartthings account
- Turning AC on and off
- Getting and setting target temperature
- Getting current temperature
- Getting and setting mode
