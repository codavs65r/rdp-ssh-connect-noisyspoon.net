# RDP and SSH Connect

## Genral

Connect to hosts in $HOME/.config/rd-ssh-connect/config.json file with Remmina (RDP or VNC) or SSH.

## Requrirements

External programs required:

- gnome-terminal for SSH connections
- ssh for SSH conecttions
- remmina for RDP and VNC connections

## Configuration

Default $HOME/.config/rd-ssh-connect/config.json file:

    {
        "desktop": [
            {
                "protocol": "rdp",
                "name": "Dummy",
                "server": "dummy",
                "port": 3389,
                "username": "johndoe",
                "password": "xxxddd&&&!!!",
                "fullscreen": true
            },
            {
                "protocol": "vnc",
                "name": "Dummy",
                "server": "dummy",
                "port": 5900,
                "username": "johndoe",
                "password": "xxxddd&&&!!!",
                "fullscreen": true
            }
        ],
        "ssh": [
            {
                "name": "Dummy",
                "server": "dummy"
            }
        ]
    }