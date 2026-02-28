-- ==============================================
-- Migration: V1__create_employee_table.sql
-- Purpose : Create Employee table matching JPA model
-- ==============================================

CREATE TABLE employee (
    emp_id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    is_manager BOOLEAN DEFAULT FALSE,
    is_tl BOOLEAN DEFAULT FALSE,
    reporting_to BIGINT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_reporting_to
        FOREIGN KEY (reporting_to)
        REFERENCES employee(emp_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
