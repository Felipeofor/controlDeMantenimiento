package com.kavak.challenge.maintenancesystem.repository;

import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import com.kavak.challenge.maintenancesystem.domain.MaintenanceStatus;
import com.kavak.challenge.maintenancesystem.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicle(Vehicle vehicle);

    List<Maintenance> findByVehicleAndEstadoIn(Vehicle vehicle, List<MaintenanceStatus> estados);
}
