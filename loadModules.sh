﻿﻿﻿﻿#!/bin/bash

# Cargar el módulo videodev
if ! lsmod | grep -q videodev; then
    echo "Cargando el módulo videodev..."
    sudo modprobe videodev
    echo "El módulo videodev ha sido cargado correctamente."
else
    echo "El módulo videodev ya está cargado."
fi

# Cargar el módulo gspca_main
if ! lsmod | grep -q gspca_main; then
    echo "Cargando el módulo gspca_main..."
    sudo modprobe gspca_main
    echo "El módulo gspca_main ha sido cargado correctamente."
else
    echo "El módulo gspca_main ya está cargado."
fi

# Cargar el módulo gspca_kinect
if ! lsmod | grep -q gspca_kinect; then
    echo "Cargando el módulo gspca_kinect..."
    sudo modprobe gspca_kinect
    echo "El módulo gspca_kinect ha sido cargado correctamente."
else
    echo "El módulo gspca_kinect ya está cargado."
fi
