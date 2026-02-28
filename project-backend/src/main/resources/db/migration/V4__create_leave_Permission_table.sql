CREATE TABLE leave_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    leave_duration VARCHAR(30),
    from_date DATE,
    to_date DATE,
    leave_days INT,
    leave_type VARCHAR(20),                -- CL / SL / LOP
    reason TEXT,
    permission_in_time TIME,
    permission_out_time TIME,
    permission_hours DECIMAL(5,2),
    permission_minutes INT,
    applied_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',  -- Pending / Approved / Rejected
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employee(emp_id),
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(emp_id)
);
