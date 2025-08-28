#!/bin/sh

amixer sset Master 1%+
/home/artkap/scripts/status_bar.js refresh volume
