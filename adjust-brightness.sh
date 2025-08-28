#!/bin/sh

function adjbrightness() {
    if [ $1 -gt 0 ] && [ $1 -lt 101 ]; then
        echo $(((($1 / 100.0) * `cat /sys/class/backlight/amdgpu_bl1/max_brightness`)/ 1)) | xargs printf "%.0f\n"
        sudo echo $(((($1 / 100.0) * `cat /sys/class/backlight/amdgpu_bl1/max_brightness`)/ 1)) | xargs printf "%.0f\n" > /sys/class/backlight/amdgpu_bl1/brightness
        xrandr --output eDP --brightness $2
    else
        echo "Enter a number from 1 to 100"
    fi
}