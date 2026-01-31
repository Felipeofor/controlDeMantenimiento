-- V1__Initial_Schema.sql
-- Migración inicial para el sistema de mantenimiento Kavak

CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    patente VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER NOT NULL,
    kilometraje_actual DOUBLE PRECISION NOT NULL
);

CREATE TABLE maintenances (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    tipo_mantenimiento VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,
    costo_estimado DOUBLE PRECISION NOT NULL,
    costo_final DOUBLE PRECISION,
    CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_patente ON vehicles(patente);
CREATE INDEX idx_maintenances_vehicle_id ON maintenances(vehicle_id);
