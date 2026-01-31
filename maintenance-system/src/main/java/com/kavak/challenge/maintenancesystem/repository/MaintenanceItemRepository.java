package com.kavak.challenge.maintenancesystem.repository;

import com.kavak.challenge.maintenancesystem.domain.MaintenanceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceItemRepository extends JpaRepository<MaintenanceItem, Long> {
}
