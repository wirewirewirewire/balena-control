# balena-control 🖥️

This package allows you to control any device running [Balena OS](https://www.balena.io) from your local network. It exposes an API which allows you to trigger different actions.

### Usage

Add the `balenablocks/control` as `services` to your ```docker-compose.yml```.

```yml
version: '2.1'
services:
  balena-control:
    image: balenablocks/control
    restart: always
    privileged: true
    ports:
      - 3009:3009
    environment:
      # Environment variables
      - DISPLAY=:0
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

`http://XXX.XXX.XXX.XXX:3009` is the local IP adress of your device. `3009` is the default port `balena-control` is running on.

### Get status

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

### Shutdown computer 📴

> [!WARNING]  
> This will also shut down the network of Raspberry Pi computers, so it will not react to any WOL triggers.

Shuts down the computer.

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

### Sleep computer

```
POST http://XXX.XXX.XXX.XXX:3009/sleep
```


#### Returns

```json
{
  "status": "prepare-sleep",
  ...
}
```

### Display 📺

Use this to change the configuration of the display.

```
POST http://XXX.XXX.XXX.XXX:3009/display
```

```json
[{
  "display": 0,
  "status": "off"
}]
```

`display` the ID of the display
`status` allows `on` and `off`

#### Returns

```json
{
  "display": "off",
  ...
}
```

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
