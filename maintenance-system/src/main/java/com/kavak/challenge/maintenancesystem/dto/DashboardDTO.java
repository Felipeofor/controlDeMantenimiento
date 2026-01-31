package com.kavak.challenge.maintenancesystem.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardDTO {
    private int totalVehicles;
    private int vehiclesInService;
    private double totalMaintenanceCost;
    private double averageMaintenanceCost;
    private Map<String, Long> maintenanceByType;
    private Map<String, Long> maintenanceByStatus;
    private List<MaintenanceDTO> recentMaintenances;
}
