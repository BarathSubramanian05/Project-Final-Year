CREATE TABLE work_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assigned_work_id BIGINT,
    date DATE,
    work_hours DOUBLE,
    start_time TIME,
    end_time TIME,
    project_activity VARCHAR(255),
    assigned_work VARCHAR(255),
    status VARCHAR(50),
    remarks VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_work_details_assigned_work FOREIGN KEY (assigned_work_id) REFERENCES assigned_work(id)
);
