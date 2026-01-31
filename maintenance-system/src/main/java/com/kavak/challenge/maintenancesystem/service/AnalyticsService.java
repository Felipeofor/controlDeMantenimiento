package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.dto.AnalyticsDTO;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceRepository;
import com.kavak.challenge.maintenancesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final VehicleRepository vehicleRepository;
        private final MaintenanceRepository maintenanceRepository;
        private final VehicleService vehicleService;

        public AnalyticsDTO getFleetAnalytics() {
                List<Vehicle> allVehicles = vehicleRepository.findAll();
                List<Maintenance> allMaintenances = maintenanceRepository.findAll();

                long totalVehicles = allVehicles.size();
                long availableVehicles = allVehicles.stream().filter(vehicleService::isAvailable).count();
                long inServiceVehicles = totalVehicles - availableVehicles;

                double totalSpent = allMaintenances.stream()
                                .filter(m -> m.getEstado() == MaintenanceStatus.COMPLETADO)
                                .mapToDouble(m -> m.getCostoFinal() != null ? m.getCostoFinal() : 0.0)
                                .sum();

                long completedCount = allMaintenances.stream()
                                .filter(m -> m.getEstado() == MaintenanceStatus.COMPLETADO)
                                .count();

                double avgCost = completedCount > 0 ? totalSpent / completedCount : 0.0;

                java.util.Map<String, Long> maintenanceByType = allMaintenances.stream()
                                .collect(Collectors.groupingBy(m -> m.getTipoMantenimiento().name(),
                                                Collectors.counting()));

                java.util.Map<String, Long> maintenanceByStatus = allMaintenances.stream()
                                .collect(Collectors.groupingBy(m -> m.getEstado().name(),
                                                Collectors.counting()));

                return AnalyticsDTO.builder()
                                .totalVehicles(totalVehicles)
                                .availableVehicles(availableVehicles)
                                .inServiceVehicles(inServiceVehicles)
                                .totalSpent(totalSpent)
                                .averageMaintenanceCost(avgCost)
                                .maintenanceByType(maintenanceByType)
                                .maintenanceByStatus(maintenanceByStatus)
                                .averageCostByBrand(calculateAverageCostByBrand(allMaintenances))
                                .build();
        }

        private java.util.Map<String, Double> calculateAverageCostByBrand(List<Maintenance> maintenances) {
                return maintenances.stream()
                                .filter(m -> m.getEstado() == MaintenanceStatus.COMPLETADO && m.getCostoFinal() != null)
                                .collect(Collectors.groupingBy(
                                                m -> m.getVehicle().getMarca(),
                                                Collectors.averagingDouble(Maintenance::getCostoFinal)));
        }
}
