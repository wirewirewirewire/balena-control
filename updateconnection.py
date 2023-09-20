import argparse
import socket
import struct

import dbus

# This example asks settings service for all configured connections.
# It also asks for secrets, demonstrating the mechanism the secrets can
# be handled with.

bus = dbus.SystemBus()


def ip_to_int(ip_string):
    return struct.unpack("=I", socket.inet_aton(ip_string))[0]


def int_to_ip(ip_int):
    return socket.inet_ntoa(struct.pack("=I", ip_int))


def merge_secrets(proxy, config, setting_name):
    try:
        # returns a dict of dicts mapping name::setting, where setting is a dict
        # mapping key::value.  Each member of the 'setting' dict is a secret
        secrets = proxy.GetSecrets(setting_name)

        # Copy the secrets into our connection config
        for setting in secrets:
            for key in secrets[setting]:
                config[setting_name][key] = secrets[setting][key]
    except Exception, e:
        pass


def dict_to_string(d, indent):
    # Try to trivially translate a dictionary's elements into nice string
    # formatting.
    dstr = ""
    for key in d:
        val = d[key]
        str_val = ""
        add_string = True
        if type(val) == type(dbus.Array([])):
            for elt in val:
                if type(elt) == type(dbus.Byte(1)):
                    str_val += "%s " % int(elt)
                elif type(elt) == type(dbus.String("")):
                    str_val += "%s" % elt
        elif type(val) == type(dbus.Dictionary({})):
            dstr += dict_to_string(val, indent + "    ")
            add_string = False
        else:
            str_val = val
        if add_string:
            dstr += "%s%s: %s\n" % (indent, key, str_val)
    return dstr


def connection_to_string(config):
    # dump a connection configuration to a the console
    for setting_name in config:
        print "        Setting: %s" % setting_name
        print dict_to_string(config[setting_name], "            ")
    print ""


def print_connections():
    # Ask the settings service for the list of connections it provides
    service_name = "org.freedesktop.NetworkManager"
    proxy = bus.get_object(service_name, "/org/freedesktop/NetworkManager/Settings")
    settings = dbus.Interface(proxy, "org.freedesktop.NetworkManager.Settings")
    connection_paths = settings.ListConnections()

    # List each connection's name, UUID, and type
    for path in connection_paths:
        con_proxy = bus.get_object(service_name, path)
        settings_connection = dbus.Interface(con_proxy, "org.freedesktop.NetworkManager.Settings.Connection")
        config = settings_connection.GetSettings()

        # Now get secrets too; we grab the secrets for each type of connection
        # (since there isn't a "get all secrets" call because most of the time
        # you only need 'wifi' secrets or '802.1x' secrets, not everything) and
        # merge that into the configuration data
        merge_secrets(settings_connection, config, '802-11-wireless')
        merge_secrets(settings_connection, config, '802-11-wireless-security')
        merge_secrets(settings_connection, config, '802-1x')
        merge_secrets(settings_connection, config, 'gsm')
        merge_secrets(settings_connection, config, 'cdma')
        merge_secrets(settings_connection, config, 'ppp')

        # Get the details of the 'connection' setting
        s_con = config['connection']
        print "    name: %s" % s_con['id']
        print "    uuid: %s" % s_con['uuid']
        print "    type: %s" % s_con['type']
        print "    ------------------------------------------"
        connection_to_string(config)

    print ""


def print_connection_settings(search_uuid):
    # Ask the settings service for the list of connections it provides
    service_name = "org.freedesktop.NetworkManager"
    proxy = bus.get_object(service_name, "/org/freedesktop/NetworkManager/Settings")
    settings = dbus.Interface(proxy, "org.freedesktop.NetworkManager.Settings")
    connection_paths = settings.ListConnections()

    # List each connection's name, UUID, and type
    for path in connection_paths:
        con_proxy = bus.get_object(service_name, path)
        settings_connection = dbus.Interface(con_proxy, "org.freedesktop.NetworkManager.Settings.Connection")
        config = settings_connection.GetSettings()

        # Now get secrets too; we grab the secrets for each type of connection
        # (since there isn't a "get all secrets" call because most of the time
        # you only need 'wifi' secrets or '802.1x' secrets, not everything) and
        # merge that into the configuration data
        merge_secrets(settings_connection, config, '802-11-wireless')
        merge_secrets(settings_connection, config, '802-11-wireless-security')
        merge_secrets(settings_connection, config, '802-1x')
        merge_secrets(settings_connection, config, 'gsm')
        merge_secrets(settings_connection, config, 'cdma')
        merge_secrets(settings_connection, config, 'ppp')

        # Get the details of the 'connection' setting
        s_con = config['connection']
        connection_uuid = s_con['uuid']

        if connection_uuid == search_uuid:
            print config


def get_connection_uuid(search_id):
    # Ask the settings service for the list of connections it provides
    service_name = "org.freedesktop.NetworkManager"
    proxy = bus.get_object(service_name, "/org/freedesktop/NetworkManager/Settings")
    settings = dbus.Interface(proxy, "org.freedesktop.NetworkManager.Settings")
    connection_paths = settings.ListConnections()

    # List each connection's name, UUID, and type
    for path in connection_paths:
        con_proxy = bus.get_object(service_name, path)
        settings_connection = dbus.Interface(con_proxy, "org.freedesktop.NetworkManager.Settings.Connection")
        config = settings_connection.GetSettings()

        # Now get secrets too; we grab the secrets for each type of connection
        # (since there isn't a "get all secrets" call because most of the time
        # you only need 'wifi' secrets or '802.1x' secrets, not everything) and
        # merge that into the configuration data
        merge_secrets(settings_connection, config, '802-11-wireless')
        merge_secrets(settings_connection, config, '802-11-wireless-security')
        merge_secrets(settings_connection, config, '802-1x')
        merge_secrets(settings_connection, config, 'gsm')
        merge_secrets(settings_connection, config, 'cdma')
        merge_secrets(settings_connection, config, 'ppp')

        # Get the details of the 'connection' setting
        s_con = config['connection']
        connection_id = s_con['id']

        if connection_id == search_id:
            return s_con['uuid']

    return False


def update_connection(uuid, method, ip, prefix, gateway, dns1, dns2):
    bus = dbus.SystemBus()
    proxy = bus.get_object("org.freedesktop.NetworkManager", "/org/freedesktop/NetworkManager/Settings")
    settings = dbus.Interface(proxy, "org.freedesktop.NetworkManager.Settings")

    for c_path in settings.ListConnections():
        c_proxy = bus.get_object("org.freedesktop.NetworkManager", c_path)
        c_obj = dbus.Interface(c_proxy, "org.freedesktop.NetworkManager.Settings.Connection")
        c_settings = c_obj.GetSettings()

        # Look for the requested connection UUID
        if c_settings['connection']['uuid'] != uuid:
            continue

        print c_settings

        # add IPv4 setting if it doesn't yet exist
        if 'ipv4' not in c_settings:
            c_settings['ipv4'] = {}

        # clear existing address info
        if c_settings['ipv4'].has_key('addresses'):
            del c_settings['ipv4']['addresses']
        if c_settings['ipv4'].has_key('address-data'):
            del c_settings['ipv4']['address-data']
        if c_settings['ipv4'].has_key('gateway'):
            del c_settings['ipv4']['gateway']

        # set the method and change properties
        c_settings['ipv4']['method'] = method
        if method == "manual":
            # Add the static IP address, prefix, and gateway
            addr1 = dbus.Array([ip_to_int(ip), dbus.UInt32(int(prefix)), ip_to_int(gateway)],
                               signature=dbus.Signature('u'))
            c_settings['ipv4'][dbus.String(unicode('addresses'))] = dbus.Array([addr1], signature=dbus.Signature('au'))
            c_settings['ipv4'][dbus.String(unicode('dns'))] = dbus.Array([ip_to_int(dns1), ip_to_int(dns2)],
                                                                         signature=dbus.Signature('u'))

            # Save all the updated settings back to NetworkManager
            c_obj.Update(c_settings)

        return True


def reactivate(interface_name="eth0"):
    bus = dbus.SystemBus()
    proxy = bus.get_object("org.freedesktop.NetworkManager", "/org/freedesktop/NetworkManager")
    nm = dbus.Interface(proxy, "org.freedesktop.NetworkManager")
    devpath = nm.GetDeviceByIpIface(interface_name)
    nm.ActivateConnection('/', devpath, '/')


parser = argparse.ArgumentParser(description='Add connection via network manager')
parser.add_argument('ip', type=str, help='ip address')
parser.add_argument('cidr', type=int, help='cidr')
parser.add_argument('gateway', type=str, help='gateway address')
parser.add_argument('dns1', type=str, help='dns address 1')
parser.add_argument('dns2', type=str, help='dns address 2')

args = parser.parse_args()

print_connections()

connection_uuid = get_connection_uuid('Wired connection 1')

if connection_uuid:
    result = update_connection(connection_uuid, 'manual', args.ip, args.cidr, args.gateway, args.dns1, args.dns2)
    print result
    print_connection_settings(connection_uuid)
    reactivate()
else:
    print False
