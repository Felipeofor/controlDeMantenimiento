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
        private final TenantRepository tenantRepository;
        private final UserRepository userRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                if (tenantRepository.count() == 0) {
                        Tenant defaultTenant = Tenant.builder()
                                        .name("Kavak Demo")
                                        .build();
                        tenantRepository.save(defaultTenant);

                        User admin = User.builder()
                                        .email("admin@kavak.com")
                                        .password(passwordEncoder.encode("password"))
                                        .firstName("Admin")
                                        .lastName("User")
                                        .role(Role.ADMIN)
                                        .tenant(defaultTenant)
                                        .build();
                        userRepository.save(admin);

                        if (vehicleRepository.count() == 0) {
                                Vehicle corolla = Vehicle.builder()
                                                .patente("AF 123 BK")
                                                .marca("Toyota")
                                                .modelo("Corolla")
                                                .anio(2022)
                                                .kilometrajeActual(15400.0)
                                                .proximoMantenimientoKm(20000.0)
                                                .tenant(defaultTenant)
                                                .build();

                                Vehicle vento = Vehicle.builder()
                                                .patente("AE 987 XP")
                                                .marca("Volkswagen")
                                                .modelo("Vento")
                                                .anio(2021)
                                                .kilometrajeActual(42000.0)
                                                .proximoMantenimientoKm(40000.0)
                                                .tenant(defaultTenant)
                                                .build();

                                Vehicle cronos = Vehicle.builder()
                                                .patente("AG 456 ZZ")
                                                .marca("Fiat")
                                                .modelo("Cronos")
                                                .anio(2023)
                                                .kilometrajeActual(8200.0)
                                                .proximoMantenimientoKm(10000.0)
                                                .tenant(defaultTenant)
                                                .build();

                                Vehicle p208 = Vehicle.builder()
                                                .patente("AD 111 QW")
                                                .marca("Peugeot")
                                                .modelo("208")
                                                .anio(2024)
                                                .kilometrajeActual(27400.0)
                                                .proximoMantenimientoKm(30000.0)
                                                .tenant(defaultTenant)
                                                .build();

                                List<Vehicle> initialVehicles = List.of(corolla, vento, cronos, p208);
                                vehicleRepository.saveAll((Iterable<Vehicle>) initialVehicles);

                                // Seed some maintenance for the vento
                                Maintenance m1 = Maintenance.builder()
                                                .vehicle(vento)
                                                .tipoMantenimiento(MaintenanceType.CAMBIO_ACEITE)
                                                .descripcion("Cambio de aceite y filtro sintético")
                                                .fechaCreacion(LocalDateTime.now().minusDays(10))
                                                .estado(MaintenanceStatus.COMPLETADO)
                                                .costoEstimado(35000.0)
                                                .costoFinal(38500.0)
                                                .tenant(defaultTenant)
                                                .build();

                                Maintenance m2 = Maintenance.builder()
                                                .vehicle(vento)
                                                .tipoMantenimiento(MaintenanceType.FRENOS)
                                                .descripcion("Revisión de pastillas de freno")
                                                .fechaCreacion(LocalDateTime.now().minusDays(2))
                                                .estado(MaintenanceStatus.EN_PROCESO)
                                                .costoEstimado(25000.0)
                                                .tenant(defaultTenant)
                                                .build();

                                List<Maintenance> initialMaintenances = List.of(m1, m2);
                                maintenanceRepository.saveAll((Iterable<Maintenance>) initialMaintenances);
                        }

                        // Create a second tenant for isolation testing
                        Tenant uberTenant = Tenant.builder()
                                        .name("Uber Fleet")
                                        .build();
                        tenantRepository.save(uberTenant);

                        User uberAdmin = User.builder()
                                        .email("uber@kavak.com")
                                        .password(passwordEncoder.encode("password"))
                                        .firstName("Uber")
                                        .lastName("Admin")
                                        .role(Role.ADMIN)
                                        .tenant(uberTenant)
                                        .build();
                        userRepository.save(uberAdmin);
                }
        }
}
