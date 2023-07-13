#!/bin/bash

# Agregar módulos al archivo /etc/modules si no están presentes
modules_file="/etc/modules"
declare -a modules=("videodev" "gspca_main" "gspca_kinect")

for module in "${modules[@]}"; do
    if ! grep -q "^$module$" "$modules_file"; then
        echo "Agregando $module al archivo $modules_file..."
        echo "$module" | sudo tee -a "$modules_file" > /dev/null
        echo "$module ha sido agregado correctamente."
    else
        echo "$module ya está presente en $modules_file."
    fi
done

# Reiniciar la Raspberry Pi
echo "Reiniciando la Raspberry Pi..."
sudo reboot
