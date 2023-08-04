# balena-control

This package allows you to control any device running [Balena OS](https://www.balena.io) from your local network. It exposes an API which allows you to trigger different actions.

### Configuration

Out of the box there is no need for a configuration, but it is possible to override the default values.

```
BALENA_CONTROL_PORT=3009
```

### Security 🔒

The request is similar to WOL not encrypted or secured. Make sure it only runs inside a private network. You can have a minor 

```
BALENA_CONTROL_TOKEN=random_string
```


### Get status

```
GET http://XXX.XXX.XXX.XXX:3009/status
```

#### Returns

```json
{
  "status": "online",
  "display: "active"
}
```

### Shutdown computer

```
POST http://XXX.XXX.XXX.XXX:3009/shutdown
```

#### Returns

```json
{
  "status": "prepare-shutdown",
  "display: "active"
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

### Display

```
POST http://XXX.XXX.XXX.XXX:3009/display
```

#### Returns

```json
{
  "display": "off",
  ...
}
```
