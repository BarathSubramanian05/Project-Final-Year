CREATE TABLE assigned_work (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    project_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    assigned_by_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,

    description varchar(100),
    assigned_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING | IN_PROGRESS | COMPLETED

    is_deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_assigned_work_project FOREIGN KEY (project_id) REFERENCES project(id),
    CONSTRAINT fk_assigned_work_employee FOREIGN KEY (employee_id) REFERENCES employee(emp_id),
    CONSTRAINT fk_assigned_work_manager FOREIGN KEY (manager_id) REFERENCES employee(emp_id),
    CONSTRAINT fk_assigned_work_assignedby FOREIGN KEY (assigned_by_id) REFERENCES employee(emp_id),
    CONSTRAINT fk_assigned_work_activity FOREIGN KEY (activity_id) REFERENCES activity(id)
);
