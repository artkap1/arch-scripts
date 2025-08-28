nmcli con add \
  type wifi \
  ifname eduroam \
  con-name eduroam \
  ssid eduroam \
  ipv4.method auto \
  802-1x.eap peap \
  802-1x.phase2-auth mschapv2 \
  802-1x.identity 563064@student.saxion.nl \
  802-1x.password Qwerty1! \
  wifi-sec.key-mgmt wpa-eap
