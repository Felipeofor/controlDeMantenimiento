package com.kavak.challenge.maintenancesystem.controller;

import com.kavak.challenge.maintenancesystem.dto.AnalyticsDTO;
import com.kavak.challenge.maintenancesystem.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/fleet")
    public ResponseEntity<AnalyticsDTO> getFleetAnalytics() {
        return ResponseEntity.ok(analyticsService.getFleetAnalytics());
    }
}
