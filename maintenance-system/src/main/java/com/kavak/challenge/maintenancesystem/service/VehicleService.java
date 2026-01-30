package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.exception.ResourceNotFoundException;
import com.kavak.challenge.maintenancesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    @Transactional
    public Vehicle registerVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateMileage(Long id, Double newMileage) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado."));
        vehicle.setKilometrajeActual(newMileage);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado."));
    }

    public Vehicle getByPatente(String patente) {
        return vehicleRepository.findByPatente(patente)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Vehículo con patente " + patente + " no encontrado."));
    }

    public boolean isAvailable(Vehicle vehicle) {
        return vehicle.getMaintenances().stream()
                .noneMatch(m -> m.getEstado() == MaintenanceStatus.PENDIENTE ||
                        m.getEstado() == MaintenanceStatus.EN_PROCESO);
    }

    public Double calculateTotalCost(Vehicle vehicle) {
        return vehicle.getMaintenances().stream()
                .filter(m -> m.getEstado() == MaintenanceStatus.COMPLETADO)
                .mapToDouble(m -> m.getCostoFinal() != null ? m.getCostoFinal() : 0.0)
                .sum();
    }
}
