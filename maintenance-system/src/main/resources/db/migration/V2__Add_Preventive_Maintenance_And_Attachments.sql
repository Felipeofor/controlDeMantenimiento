-- V2__Add_Preventive_Maintenance_And_Attachments.sql
-- Agrega soporte para alertas preventivas y adjuntos de mantenimiento

-- 1. Agregar campo para mantenimiento preventivo a vehículos
ALTER TABLE vehicles 
ADD COLUMN proximo_mantenimiento_km DOUBLE PRECISION DEFAULT 0 NOT NULL;

-- 2. Crear tabla para adjuntos (documentación, fotos, facturas)
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    maintenance_id BIGINT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_maintenance FOREIGN KEY (maintenance_id) REFERENCES maintenances(id) ON DELETE CASCADE
);

-- 3. Índice para mejorar performance de búsquedas de adjuntos
CREATE INDEX idx_attachments_maintenance_id ON attachments(maintenance_id);
