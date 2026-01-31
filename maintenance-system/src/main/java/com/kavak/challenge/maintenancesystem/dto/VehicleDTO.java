package com.kavak.challenge.maintenancesystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VehicleDTO {
    private Long id;

    @NotBlank(message = "La patente es obligatoria")
    @Pattern(regexp = "^[A-Z]{2}\\s?\\d{3}\\s?[A-Z]{2}|[A-Z]{3}\\s?\\d{3}$", message = "Formato de patente inválido")
    private String patente;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 1900, message = "Año inválido")
    private Integer anio;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Double kilometrajeActual;

    @NotNull(message = "El kilometraje de próximo mantenimiento es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Double proximoMantenimientoKm;

    private Boolean requiereMantenimiento;

    private Boolean disponible;
}
