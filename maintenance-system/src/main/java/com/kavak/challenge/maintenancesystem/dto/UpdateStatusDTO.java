package com.kavak.challenge.maintenancesystem.dto;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import lombok.Data;

@Data
public class UpdateStatusDTO {
    private MaintenanceStatus nuevoEstado;
    private Double costoFinal;
}
