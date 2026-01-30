package com.kavak.challenge.maintenancesystem.dto;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceType;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceDTO {
    private Long id;
    private Long vehicleId;
    private MaintenanceType tipoMantenimiento;
    private String descripcion;
    private LocalDateTime fechaCreacion;
    private MaintenanceStatus estado;
    private Double costoEstimado;
    private Double costoFinal;
}
