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
        private final com.kavak.challenge.maintenancesystem.service.FileStorageService fileStorageService;

        @PostMapping
        public ResponseEntity<MaintenanceDTO> register(@jakarta.validation.Valid @RequestBody MaintenanceDTO dto) {
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
                                .ok(convertToDto(maintenanceService.updateStatus(id, dto.getNuevoEstado(),
                                                dto.getCostoFinal())));
        }

        @PostMapping("/{id}/items")
        public ResponseEntity<com.kavak.challenge.maintenancesystem.dto.MaintenanceItemDTO> addItem(
                        @PathVariable Long id,
                        @jakarta.validation.Valid @RequestBody com.kavak.challenge.maintenancesystem.dto.MaintenanceItemDTO dto) {
                var item = com.kavak.challenge.maintenancesystem.domain.MaintenanceItem.builder()
                                .descripcion(dto.getDescripcion())
                                .tipo(dto.getTipo())
                                .costo(dto.getCosto())
                                .build();
                var saved = maintenanceService.addItem(id, item);
                return ResponseEntity.ok(com.kavak.challenge.maintenancesystem.dto.MaintenanceItemDTO.builder()
                                .id(saved.getId())
                                .descripcion(saved.getDescripcion())
                                .tipo(saved.getTipo())
                                .costo(saved.getCosto())
                                .build());
        }

        @PostMapping("/{id}/upload")
        public ResponseEntity<com.kavak.challenge.maintenancesystem.dto.AttachmentDTO> uploadFile(
                        @PathVariable Long id,
                        @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
                String fileName = fileStorageService.storeFile(file);
                String fileUrl = "/api/uploads/" + fileName;
                var attachment = maintenanceService.addAttachment(id, file.getOriginalFilename(), fileUrl);
                return ResponseEntity.ok(com.kavak.challenge.maintenancesystem.dto.AttachmentDTO.builder()
                                .id(attachment.getId())
                                .nombre(attachment.getNombre())
                                .url(attachment.getUrl())
                                .build());
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

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(@PathVariable Long id) {
                maintenanceService.deleteMaintenance(id);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/{id}/attachments")
        public ResponseEntity<com.kavak.challenge.maintenancesystem.dto.AttachmentDTO> addAttachment(
                        @PathVariable Long id,
                        @RequestBody com.kavak.challenge.maintenancesystem.dto.AttachmentDTO dto) {
                var attachment = maintenanceService.addAttachment(id, dto.getNombre(), dto.getUrl());
                return ResponseEntity.ok(com.kavak.challenge.maintenancesystem.dto.AttachmentDTO.builder()
                                .id(attachment.getId())
                                .nombre(attachment.getNombre())
                                .url(attachment.getUrl())
                                .build());
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

                if (m.getVehicle() != null) {
                        dto.setVehiclePlate(m.getVehicle().getPatente());
                        dto.setVehicleBrand(m.getVehicle().getMarca());
                        dto.setVehicleModel(m.getVehicle().getModelo());
                }

                if (m.getAdjuntos() != null) {
                        dto.setAdjuntos(m.getAdjuntos().stream()
                                        .map(a -> com.kavak.challenge.maintenancesystem.dto.AttachmentDTO.builder()
                                                        .id(a.getId())
                                                        .nombre(a.getNombre())
                                                        .url(a.getUrl())
                                                        .build())
                                        .collect(Collectors.toList()));
                }

                if (m.getItems() != null) {
                        dto.setItems(m.getItems().stream()
                                        .map(i -> com.kavak.challenge.maintenancesystem.dto.MaintenanceItemDTO.builder()
                                                        .id(i.getId())
                                                        .descripcion(i.getDescripcion())
                                                        .tipo(i.getTipo())
                                                        .costo(i.getCosto())
                                                        .build())
                                        .collect(Collectors.toList()));
                }

                return dto;
        }
}
