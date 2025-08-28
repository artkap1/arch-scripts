#!/bin/sh

choices="cancel\nreboot\nshutdown"
choice=$(echo -e "$choices" | dmenu)

case $choice in
    "shutdown") sudo loginctl poweroff ;;
    "reboot") sudo loginctl reboot ;;
esac