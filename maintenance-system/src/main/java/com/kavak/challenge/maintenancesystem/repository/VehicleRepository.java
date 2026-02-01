package com.kavak.challenge.maintenancesystem.repository;

import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Override
    @EntityGraph(attributePaths = "maintenances")
    List<Vehicle> findAll();

    java.util.Optional<Vehicle> findByPatente(String patente);

    List<Vehicle> findAllByTenant(com.kavak.challenge.maintenancesystem.domain.Tenant tenant);

    Optional<Vehicle> findByPatenteAndTenant(String patente,
            com.kavak.challenge.maintenancesystem.domain.Tenant tenant);
}
