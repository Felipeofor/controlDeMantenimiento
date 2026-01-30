package com.kavak.challenge.maintenancesystem.dto;

import lombok.Data;

@Data
public class VehicleDTO {
    private Long id;
    private String patente;
    private String marca;
    private String modelo;
    private Integer anio;
    private Double kilometrajeActual;
}
