package com.kavak.challenge.maintenancesystem;

import com.kavak.challenge.maintenancesystem.domain.*;
import com.kavak.challenge.maintenancesystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final VehicleRepository vehicleRepository;
        private final MaintenanceRepository maintenanceRepository;

        @Override
        public void run(String... args) {
                if (vehicleRepository.count() == 0) {
                        Vehicle corolla = Vehicle.builder()
                                        .patente("AF 123 BK")
                                        .marca("Toyota")
                                        .modelo("Corolla")
                                        .anio(2022)
                                        .kilometrajeActual(15400.0)
                                        .build();

                        Vehicle vento = Vehicle.builder()
                                        .patente("AE 987 XP")
                                        .marca("Volkswagen")
                                        .modelo("Vento")
                                        .anio(2021)
                                        .kilometrajeActual(42000.0)
                                        .build();

                        Vehicle cronos = Vehicle.builder()
                                        .patente("AG 456 ZZ")
                                        .marca("Fiat")
                                        .modelo("Cronos")
                                        .anio(2023)
                                        .kilometrajeActual(8200.0)
                                        .build();

                        Vehicle p208 = Vehicle.builder()
                                        .patente("AD 111 QW")
                                        .marca("Peugeot")
                                        .modelo("208")
                                        .anio(2024)
                                        .kilometrajeActual(27400.0)
                                        .build();

                        List<Vehicle> initialVehicles = List.of(corolla, vento, cronos, p208);
                        vehicleRepository.saveAll(initialVehicles);

                        // Seed some maintenance for the vento
                        Maintenance m1 = Maintenance.builder()
                                        .vehicle(vento)
                                        .tipoMantenimiento(MaintenanceType.CAMBIO_ACEITE)
                                        .descripcion("Cambio de aceite y filtro sintético")
                                        .fechaCreacion(LocalDateTime.now().minusDays(10))
                                        .estado(MaintenanceStatus.COMPLETADO)
                                        .costoEstimado(35000.0)
                                        .costoFinal(38500.0)
                                        .build();

                        Maintenance m2 = Maintenance.builder()
                                        .vehicle(vento)
                                        .tipoMantenimiento(MaintenanceType.FRENOS)
                                        .descripcion("Revisión de pastillas de freno")
                                        .fechaCreacion(LocalDateTime.now().minusDays(2))
                                        .estado(MaintenanceStatus.EN_PROCESO)
                                        .costoEstimado(25000.0)
                                        .build();

                        List<Maintenance> initialMaintenances = List.of(m1, m2);
                        maintenanceRepository.saveAll(initialMaintenances);
                }
        }
}
