package com.kavak.challenge.maintenancesystem.controller;

import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.dto.UpdateMileageDTO;
import com.kavak.challenge.maintenancesystem.dto.VehicleDTO;
import com.kavak.challenge.maintenancesystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAll() {
        return ResponseEntity.ok(vehicleService.getAll().stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<VehicleDTO> register(@jakarta.validation.Valid @RequestBody VehicleDTO dto) {
        Vehicle vehicle = Vehicle.builder()
                .patente(dto.getPatente())
                .marca(dto.getMarca())
                .modelo(dto.getModelo())
                .anio(dto.getAnio())
                .kilometrajeActual(dto.getKilometrajeActual())
                .proximoMantenimientoKm(dto.getProximoMantenimientoKm())
                .build();

        return ResponseEntity.ok(convertToDto(vehicleService.registerVehicle(vehicle)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(convertToDto(vehicleService.getById(id)));
    }

    @GetMapping("/patente/{patente}")
    public ResponseEntity<VehicleDTO> getByPatente(@PathVariable String patente) {
        return ResponseEntity.ok(convertToDto(vehicleService.getByPatente(patente)));
    }

    @PatchMapping("/{id}/mileage")
    public ResponseEntity<VehicleDTO> updateMileage(@PathVariable Long id, @RequestBody UpdateMileageDTO dto) {
        return ResponseEntity.ok(convertToDto(vehicleService.updateMileage(id, dto.getNuevoKilometraje())));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        boolean available = vehicleService.isAvailable(vehicle);
        return ResponseEntity.ok(Map.of(
                "vehicleId", id,
                "available", available,
                "message", available ? "Vehículo disponible" : "Vehículo en mantenimiento"));
    }

    @GetMapping("/{id}/total-cost")
    public ResponseEntity<Map<String, Object>> getTotalCost(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        return ResponseEntity.ok(Map.of(
                "vehicleId", id,
                "totalCost", vehicleService.calculateTotalCost(vehicle)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> update(@PathVariable Long id,
            @jakarta.validation.Valid @RequestBody VehicleDTO dto) {
        Vehicle vehicle = Vehicle.builder()
                .patente(dto.getPatente())
                .marca(dto.getMarca())
                .modelo(dto.getModelo())
                .anio(dto.getAnio())
                .proximoMantenimientoKm(dto.getProximoMantenimientoKm())
                .build();
        return ResponseEntity.ok(convertToDto(vehicleService.updateVehicle(id, vehicle)));
    }

    private VehicleDTO convertToDto(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setPatente(vehicle.getPatente());
        dto.setMarca(vehicle.getMarca());
        dto.setModelo(vehicle.getModelo());
        dto.setAnio(vehicle.getAnio());
        dto.setKilometrajeActual(vehicle.getKilometrajeActual());
        dto.setProximoMantenimientoKm(vehicle.getProximoMantenimientoKm());
        dto.setRequiereMantenimiento(vehicleService.requiresMaintenance(vehicle));
        dto.setDisponible(vehicleService.isAvailable(vehicle));
        return dto;
    }
}
