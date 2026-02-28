CREATE TABLE leave_balance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    casual_leaves INT NOT NULL DEFAULT 12,
    sick_leaves INT NOT NULL DEFAULT 8,
    marriage_leaves INT NOT NULL DEFAULT 14,
    maternity_leaves INT NOT NULL DEFAULT 14,
    permission_balance DECIMAL NOT NULL DEFAULT 2.00,
    year INT,
    CONSTRAINT fk_leave_balance_employee FOREIGN KEY (employee_id)
        REFERENCES employee(emp_id)
        ON DELETE CASCADE
);
