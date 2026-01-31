package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.exception.BusinessException;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Maintenance maintenance;

    @BeforeEach
    void setUp() {
        maintenance = Maintenance.builder()
                .id(1L)
                .estado(MaintenanceStatus.PENDIENTE)
                .build();
    }

    @Test
    void testValidTransitionToEnProceso() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.save(any(Maintenance.class))).thenReturn(maintenance);

        Maintenance result = maintenanceService.updateStatus(1L, MaintenanceStatus.EN_PROCESO, null);

        assertEquals(MaintenanceStatus.EN_PROCESO, result.getEstado());
    }

    @Test
    void testInvalidTransitionFromPendienteToCompletado() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));

        assertThrows(BusinessException.class, () -> {
            maintenanceService.updateStatus(1L, MaintenanceStatus.COMPLETADO, null);
        });
    }

    @Test
    void testCannotChangeStatusOfCompletedMaintenance() {
        maintenance.setEstado(MaintenanceStatus.COMPLETADO);
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));

        assertThrows(BusinessException.class, () -> {
            maintenanceService.updateStatus(1L, MaintenanceStatus.CANCELADO, null);
        });
    }

    @Test
    void testCancelFromEnProceso() {
        maintenance.setEstado(MaintenanceStatus.EN_PROCESO);
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.save(any(Maintenance.class))).thenReturn(maintenance);

        Maintenance result = maintenanceService.updateStatus(1L, MaintenanceStatus.CANCELADO, null);

        assertEquals(MaintenanceStatus.CANCELADO, result.getEstado());
    }
}
