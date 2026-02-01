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
import java.util.List;
import com.kavak.challenge.maintenancesystem.repository.MaintenanceItemRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private MaintenanceItemRepository itemRepository;

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

    @Test
    void testDeleteMaintenance_Success() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));

        assertDoesNotThrow(() -> maintenanceService.deleteMaintenance(1L));
        verify(maintenanceRepository, times(1)).delete(maintenance);
    }

    @Test
    void testDeleteMaintenance_ThrowsWhenCompleted() {
        maintenance.setEstado(MaintenanceStatus.COMPLETADO);
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));

        assertThrows(BusinessException.class, () -> maintenanceService.deleteMaintenance(1L));
        verify(maintenanceRepository, never()).delete(any());
    }

    @Test
    void testAddItem_Success() {
        com.kavak.challenge.maintenancesystem.domain.MaintenanceItem item = com.kavak.challenge.maintenancesystem.domain.MaintenanceItem
                .builder()
                .descripcion("Cambio de aceite")
                .costo(50.0)
                .build();

        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));
        when(itemRepository.save(any())).thenReturn(item);

        var result = maintenanceService.addItem(1L, item);

        assertNotNull(result);
        assertEquals("Cambio de aceite", result.getDescripcion());
    }

    @Test
    void testUpdateStatus_CalculatesFinalCostFromItems() {
        maintenance.setEstado(MaintenanceStatus.EN_PROCESO);
        maintenance.setItems(List.of(
                com.kavak.challenge.maintenancesystem.domain.MaintenanceItem.builder().costo(100.0).build(),
                com.kavak.challenge.maintenancesystem.domain.MaintenanceItem.builder().costo(50.0).build()));

        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.save(any(Maintenance.class))).thenAnswer(i -> i.getArguments()[0]);

        Maintenance result = maintenanceService.updateStatus(1L, MaintenanceStatus.COMPLETADO, null);

        assertEquals(150.0, result.getCostoFinal());
    }
}
