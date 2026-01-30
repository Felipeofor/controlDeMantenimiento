package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.exception.BusinessException;
import com.kavak.challenge.maintenancesystem.exception.ResourceNotFoundException;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    @Transactional
    public Maintenance registerMaintenance(Maintenance maintenance) {
        maintenance.setFechaCreacion(LocalDateTime.now());
        maintenance.setEstado(MaintenanceStatus.PENDIENTE);
        return maintenanceRepository.save(maintenance);
    }

    @Transactional
    public Maintenance updateStatus(Long id, MaintenanceStatus newStatus, Double finalCost) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));

        validateTransition(maintenance.getEstado(), newStatus);

        maintenance.setEstado(newStatus);
        if (newStatus == MaintenanceStatus.COMPLETADO && finalCost != null) {
            maintenance.setCostoFinal(finalCost);
        }

        return maintenanceRepository.save(maintenance);
    }

    private void validateTransition(MaintenanceStatus current, MaintenanceStatus next) {
        if (current == MaintenanceStatus.COMPLETADO || current == MaintenanceStatus.CANCELADO) {
            throw new BusinessException("No se puede cambiar el estado de un mantenimiento finalizado.");
        }

        if (current == MaintenanceStatus.PENDIENTE) {
            if (next != MaintenanceStatus.EN_PROCESO && next != MaintenanceStatus.CANCELADO) {
                throw new BusinessException("Transición inválida desde PENDIENTE.");
            }
        }

        if (current == MaintenanceStatus.EN_PROCESO) {
            if (next != MaintenanceStatus.COMPLETADO && next != MaintenanceStatus.CANCELADO) {
                throw new BusinessException("Transición inválida desde EN_PROCESO.");
            }
        }
    }

    public List<Maintenance> getByVehicle(Vehicle vehicle) {
        return maintenanceRepository.findByVehicle(vehicle);
    }

    public List<Maintenance> getActiveByVehicle(Vehicle vehicle) {
        return maintenanceRepository.findByVehicleAndEstadoIn(vehicle,
                List.of(MaintenanceStatus.PENDIENTE, MaintenanceStatus.EN_PROCESO));
    }
}
