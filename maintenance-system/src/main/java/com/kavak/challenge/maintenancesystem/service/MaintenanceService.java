package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.exception.BusinessException;
import com.kavak.challenge.maintenancesystem.exception.ResourceNotFoundException;
import com.kavak.challenge.maintenancesystem.domain.Attachment;
import com.kavak.challenge.maintenancesystem.repository.AttachmentRepository;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AttachmentRepository attachmentRepository;
    private final com.kavak.challenge.maintenancesystem.repository.MaintenanceItemRepository itemRepository;

    @Transactional
    public Maintenance registerMaintenance(Maintenance maintenance) {
        log.info("Registrando nuevo mantenimiento para vehículo ID: {}", maintenance.getVehicle().getId());
        maintenance.setFechaCreacion(LocalDateTime.now());
        maintenance.setEstado(MaintenanceStatus.PENDIENTE);
        Maintenance saved = maintenanceRepository.save(maintenance);
        log.info("Mantenimiento registrado con éxito. ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public Maintenance updateStatus(Long id, MaintenanceStatus newStatus, Double finalCost) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));

        validateTransition(maintenance.getEstado(), newStatus);

        log.info("Actualizando estado de mantenimiento ID: {} de {} a {}", id, maintenance.getEstado(), newStatus);
        maintenance.setEstado(newStatus);

        if (newStatus == MaintenanceStatus.COMPLETADO) {
            if (maintenance.getItems() != null && !maintenance.getItems().isEmpty()) {
                double calculatedCost = maintenance.getItems().stream()
                        .mapToDouble(com.kavak.challenge.maintenancesystem.domain.MaintenanceItem::getCosto)
                        .sum();
                maintenance.setCostoFinal(calculatedCost);
            } else if (finalCost != null) {
                maintenance.setCostoFinal(finalCost);
            }
        }

        return maintenanceRepository.save(maintenance);
    }

    @Transactional
    public com.kavak.challenge.maintenancesystem.domain.MaintenanceItem addItem(Long maintenanceId,
            com.kavak.challenge.maintenancesystem.domain.MaintenanceItem item) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));

        if (maintenance.getEstado() == MaintenanceStatus.COMPLETADO
                || maintenance.getEstado() == MaintenanceStatus.CANCELADO) {
            throw new BusinessException("No se pueden agregar ítems a un mantenimiento finalizado.");
        }

        item.setMaintenance(maintenance);
        return itemRepository.save(item);
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

    @Transactional
    public void deleteMaintenance(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));
        maintenanceRepository.delete(maintenance);
    }

    @Transactional
    public Attachment addAttachment(Long maintenanceId, String nombre, String url) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));

        log.info("Agregando adjunto a mantenimiento ID: {}. Nombre: {}", maintenanceId, nombre);
        Attachment attachment = Attachment.builder()
                .nombre(nombre)
                .url(url)
                .maintenance(maintenance)
                .build();

        Attachment saved = attachmentRepository.save(attachment);
        return saved;
    }
}
