package com.kavak.challenge.maintenancesystem.repository;

import com.kavak.challenge.maintenancesystem.domain.Attachment;
import com.kavak.challenge.maintenancesystem.domain.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByMaintenance(Maintenance maintenance);
}
