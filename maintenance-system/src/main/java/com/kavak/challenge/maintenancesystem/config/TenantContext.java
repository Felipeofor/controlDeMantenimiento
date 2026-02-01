package com.kavak.challenge.maintenancesystem.config;

import com.kavak.challenge.maintenancesystem.domain.Tenant;

public class TenantContext {

    private static final ThreadLocal<Tenant> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(Tenant tenant) {
        currentTenant.set(tenant);
    }

    public static Tenant getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
