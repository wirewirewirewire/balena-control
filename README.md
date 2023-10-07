# balena-control 🖥️

This package allows you to control any device running [Balena OS](https://www.balena.io) from your local network. It exposes an API which allows you to trigger different actions.

### Usage

Add `balena-control` as `services` to your `docker-compose.yml`.

```yml
version: "2.1"
services:
  balena-control:
    build: .
    restart: always
    privileged: true
    ports:
      - 3009:3009
    environment:
      - BALENA_CONTROL_PORT=3009
```

### Configuration ⚙️

Out of the box there is no need for a configuration, but it is possible to override the default values.

```
BALENA_CONTROL_PORT=3009
```

### Security 🔒

The request is similar to WOL not encrypted or secured. Make sure it only runs inside a private network. You can have a minor

```
BALENA_CONTROL_TOKEN=random_string
```

## Control

`http://XXX.XXX.XXX.XXX:3009` is the local IP address of your device. `3009` is the default port `balena-control` is running on.
All Responses have the general structure to verify if the response is a success:

```json
{
  success: true,
  _error: null,
  data: {...}
}
```

The Return value describes the `data` property

### Get status (WIP)

```
GET http://XXX.XXX.XXX.XXX:3009/status
```

#### Returns

```json
{
  "status": "online",
  "display": "active"
}
```

### Wake computer

Wake up the device from sleep. Turn on all the periphery and return to normal usage. This takes some time (1-5 minutes)

```
POST http://XXX.XXX.XXX.XXX:3009/wake
```

#### Returns

```json
{
	[...]
    "data": {
        "status": "all devices awake"
    }
}
```

### Sleep computer

Sleep the computer and turn all the periphery off.

```
POST http://XXX.XXX.XXX.XXX:3009/sleep
```

#### Returns

```json
{
	[...]
    "data": {
        "status": "all devices sleeping"
    }
}
```

### Reboot computer

reboot and reset the system completely.

```
POST http://XXX.XXX.XXX.XXX:3009/reboot
```

#### Returns

```json
{
	[...]
    "data": {
        "status": "success"
    }
}
```

### Shutdown computer (experimental) 📴

> [!WARNING]  
> This will also shut down the network of Raspberry Pi computers, so it will not react to any WOL triggers. The Device needs to be powered off and on manually after this!

Shut down the computer.

```
POST http://XXX.XXX.XXX.XXX:3009/shutdown
```

#### Returns

```json
{
  "status": "prepare-shutdown",
  "display": "active"
}
```

### Screenshot 📸

Enable `public device url`. Make sure you also have [xserver](https://github.com/wirewirewirewire/xserver) running. This will allow you to get a screenshot of the application currently running on the public device url.

TODO: Documentation for `XSERVER_PORT=80`

### Development

The application uses a small node.js (express) application.

```
npm run install
```

Run the development

```
npm run dev
```

Run the development without actually triggering shutdown, etc.

```
npm run dev:dry
```
