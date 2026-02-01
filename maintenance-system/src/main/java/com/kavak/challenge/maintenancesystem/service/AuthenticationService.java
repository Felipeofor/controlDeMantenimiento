package com.kavak.challenge.maintenancesystem.service;

import com.kavak.challenge.maintenancesystem.domain.Role;
import com.kavak.challenge.maintenancesystem.domain.Tenant;
import com.kavak.challenge.maintenancesystem.domain.User;
import com.kavak.challenge.maintenancesystem.dto.auth.AuthenticationRequest;
import com.kavak.challenge.maintenancesystem.dto.auth.AuthenticationResponse;
import com.kavak.challenge.maintenancesystem.dto.auth.RegisterRequest;
import com.kavak.challenge.maintenancesystem.repository.TenantRepository;
import com.kavak.challenge.maintenancesystem.repository.UserRepository;
import com.kavak.challenge.maintenancesystem.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        // Create Tenant
        var tenant = Tenant.builder()
                .name(request.getOrganizationName())
                .build();
        tenantRepository.save(tenant);

        // Create User
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN) // First user is Admin
                .tenant(tenant)
                .build();
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
