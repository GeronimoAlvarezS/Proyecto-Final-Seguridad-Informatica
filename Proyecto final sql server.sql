-- 1. Crear la base de datos
CREATE DATABASE proyectofinal;
GO

-- 2. Usar la base de datos
USE proyectofinal;
GO

-- 3. Crear tabla de usuarios (registro e inicio de sesión)
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    Document NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL
);
GO

-- 4. Crear tabla de empleados (usuarios internos del sistema de ventas)
CREATE TABLE Employees (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);
GO