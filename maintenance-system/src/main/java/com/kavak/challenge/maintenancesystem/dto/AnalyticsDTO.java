package com.kavak.challenge.maintenancesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private Long totalVehicles;
    private Long availableVehicles;
    private Long inServiceVehicles;
    private Double totalSpent;
    private Double averageMaintenanceCost;
    private Map<String, Long> maintenanceByType;
    private Map<String, Double> averageCostByBrand;
}
