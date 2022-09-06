# modbus-tester

```service
[Unit]
Description=Modbus Tester
After=multi-user.target

[Service]
Type=idle
User=pi
WorkingDirectory=/home/pi/source/modbus-tester
ExecStart=/usr/bin/npm start

[Install]
WantedBy=multi-user.target[Unit]
Description=Modbus Tester
After=multi-user.target

[Service]
Type=idle
User=pi
WorkingDirectory=/home/pi/source/modbus-tester
ExecStart=/usr/bin/npm start

[Install]
WantedBy=multi-user.target
```

```autostart
# Auto run the browser
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --start-fullscreen --incognito http://localhost:5678
```

```bash
sudo nano /etc/systemd/system/modbus-tester.service
sudo chmod 664 /lib/systemd/system/modbustester.service
sudo systemctl daemon-reload
sudo systemctl enable modbus-tester.service
sudo systemctl start modbus-tester.service
sudo journalctl -u modbustester.service
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```
