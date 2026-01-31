package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import com.kavak.challenge.maintenancesystem.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    void testIsAvailable_True_WhenNoActiveMaintenances() {
        Vehicle vehicle = Vehicle.builder()
                .maintenances(List.of(
                        Maintenance.builder().estado(MaintenanceStatus.COMPLETADO).build(),
                        Maintenance.builder().estado(MaintenanceStatus.CANCELADO).build()))
                .build();

        assertTrue(vehicleService.isAvailable(vehicle));
    }

    @Test
    void testIsAvailable_False_WhenHasEnProceso() {
        Vehicle vehicle = Vehicle.builder()
                .maintenances(List.of(
                        Maintenance.builder().estado(MaintenanceStatus.EN_PROCESO).build()))
                .build();

        assertFalse(vehicleService.isAvailable(vehicle));
    }

    @Test
    void testCalculateTotalCost_OnlyCompletados() {
        Vehicle vehicle = Vehicle.builder()
                .maintenances(List.of(
                        Maintenance.builder().estado(MaintenanceStatus.COMPLETADO).costoFinal(100.0).build(),
                        Maintenance.builder().estado(MaintenanceStatus.COMPLETADO).costoFinal(250.0).build(),
                        Maintenance.builder().estado(MaintenanceStatus.EN_PROCESO).costoEstimado(500.0).build()))
                .build();

        assertEquals(350.0, vehicleService.calculateTotalCost(vehicle));
    }
}
