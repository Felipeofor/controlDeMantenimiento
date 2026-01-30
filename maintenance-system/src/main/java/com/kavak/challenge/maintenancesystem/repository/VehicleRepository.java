package com.kavak.challenge.maintenancesystem.repository;

import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPatente(String patente);
}
