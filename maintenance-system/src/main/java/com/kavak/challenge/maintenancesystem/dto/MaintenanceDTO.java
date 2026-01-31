package com.kavak.challenge.maintenancesystem.dto;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceType;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceDTO {
    private Long id;

    @NotNull(message = "El ID del vehículo es obligatorio")
    private Long vehicleId;

    @NotNull(message = "El tipo de mantenimiento es obligatorio")
    private MaintenanceType tipoMantenimiento;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 5, message = "La descripción debe tener al menos 5 caracteres")
    private String descripcion;

    private LocalDateTime fechaCreacion;
    private MaintenanceStatus estado;

    @NotNull(message = "El costo estimado es obligatorio")
    @Min(value = 0, message = "El costo no puede ser negativo")
    private Double costoEstimado;

    private Double costoFinal;

    private java.util.List<AttachmentDTO> adjuntos;
    private java.util.List<MaintenanceItemDTO> items;

    // Campos informativos para listas y dashboards
    private String vehiclePlate;
    private String vehicleBrand;
    private String vehicleModel;
}
