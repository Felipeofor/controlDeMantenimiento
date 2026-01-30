package com.kavak.challenge.maintenancesystem.controller;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.dto.MaintenanceDTO;
import com.kavak.challenge.maintenancesystem.dto.UpdateStatusDTO;
import com.kavak.challenge.maintenancesystem.service.MaintenanceService;
import com.kavak.challenge.maintenancesystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<MaintenanceDTO> register(@RequestBody MaintenanceDTO dto) {
        Vehicle vehicle = vehicleService.getById(dto.getVehicleId());

        Maintenance maintenance = Maintenance.builder()
                .vehicle(vehicle)
                .tipoMantenimiento(dto.getTipoMantenimiento())
                .descripcion(dto.getDescripcion())
                .costoEstimado(dto.getCostoEstimado())
                .build();

        return ResponseEntity.ok(convertToDto(maintenanceService.registerMaintenance(maintenance)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceDTO> updateStatus(@PathVariable Long id, @RequestBody UpdateStatusDTO dto) {
        return ResponseEntity
                .ok(convertToDto(maintenanceService.updateStatus(id, dto.getNuevoEstado(), dto.getCostoFinal())));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceDTO>> getByVehicle(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        return ResponseEntity.ok(maintenanceService.getByVehicle(vehicle).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/vehicle/{vehicleId}/active")
    public ResponseEntity<List<MaintenanceDTO>> getActiveByVehicle(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        return ResponseEntity.ok(maintenanceService.getActiveByVehicle(vehicle).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
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
