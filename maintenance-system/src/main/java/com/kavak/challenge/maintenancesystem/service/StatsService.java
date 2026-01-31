package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.dto.DashboardDTO;
import com.kavak.challenge.maintenancesystem.dto.MaintenanceDTO;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceRepository;
import com.kavak.challenge.maintenancesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceRepository maintenanceRepository;

    public DashboardDTO getDashboardStats() {
        List<Maintenance> allMaintenances = maintenanceRepository.findAll();

        long totalVehicles = vehicleRepository.count();

        long vehiclesInService = allMaintenances.stream()
                .filter(m -> m.getEstado() == MaintenanceStatus.EN_PROCESO)
                .map(m -> m.getVehicle().getId())
                .distinct()
                .count();

        double totalCost = allMaintenances.stream()
                .filter(m -> m.getCostoFinal() != null)
                .mapToDouble(Maintenance::getCostoFinal)
                .sum();

        long completedCount = allMaintenances.stream()
                .filter(m -> m.getEstado() == MaintenanceStatus.COMPLETADO)
                .count();

        double averageCost = completedCount > 0 ? totalCost / completedCount : 0;

        Map<String, Long> byType = allMaintenances.stream()
                .collect(Collectors.groupingBy(m -> m.getTipoMantenimiento().name(), Collectors.counting()));

        Map<String, Long> byStatus = allMaintenances.stream()
                .collect(Collectors.groupingBy(m -> m.getEstado().name(), Collectors.counting()));

        List<Maintenance> recent = maintenanceRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "fechaCreacion"))).getContent();

        return DashboardDTO.builder()
                .totalVehicles((int) totalVehicles)
                .vehiclesInService((int) vehiclesInService)
                .totalMaintenanceCost(totalCost)
                .averageMaintenanceCost(averageCost)
                .maintenanceByType(byType)
                .maintenanceByStatus(byStatus)
                .recentMaintenances(recent.stream().map(this::convertToDto).collect(Collectors.toList()))
                .build();
    }

    private MaintenanceDTO convertToDto(Maintenance m) {
        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setId(m.getId());
        dto.setVehicleId(m.getVehicle().getId());
        dto.setTipoMantenimiento(m.getTipoMantenimiento());
        dto.setDescripcion(m.getDescripcion());
        dto.setFechaCreacion(m.getFechaCreacion());
        dto.setEstado(m.getEstado());
        dto.setCostoEstimado(m.getCostoEstimado());
        dto.setCostoFinal(m.getCostoFinal());
        return dto;
    }
}
