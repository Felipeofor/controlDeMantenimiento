package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.exception.ResourceNotFoundException;
import com.kavak.challenge.maintenancesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    @Transactional
    public Vehicle registerVehicle(Vehicle vehicle) {
        log.info("Registrando nuevo vehículo con patente: {}", vehicle.getPatente());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateMileage(Long id, Double newMileage) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado."));
        log.info("Actualizando kilometraje vehículo ID: {}. Anterior: {}, Nuevo: {}", id,
                vehicle.getKilometrajeActual(), newMileage);
        if (newMileage < vehicle.getKilometrajeActual()) {
            throw new com.kavak.challenge.maintenancesystem.exception.BusinessException(
                    "Error de integridad: El nuevo kilometraje no puede ser menor al actual.");
        }
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

    public boolean requiresMaintenance(Vehicle vehicle) {
        if (vehicle.getProximoMantenimientoKm() == null)
            return false;
        // Alerta si faltan menos de 1000km para el próximo servicio
        return (vehicle.getProximoMantenimientoKm() - vehicle.getKilometrajeActual()) <= 1000;
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado."));
        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado."));

        vehicle.setMarca(updatedVehicle.getMarca());
        vehicle.setModelo(updatedVehicle.getModelo());
        vehicle.setAnio(updatedVehicle.getAnio());
        vehicle.setPatente(updatedVehicle.getPatente());

        return vehicleRepository.save(vehicle);
    }
}
