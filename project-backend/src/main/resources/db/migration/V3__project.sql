CREATE TABLE project (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    manager_id BIGINT NOT NULL,
    tl_id BIGINT,
    assigned_hours DECIMAL(10,2),
    working_hours DECIMAL(10,2),
    assigned_date DATE,
    start_date DATE,
    completed_date DATE,
    project_status BOOLEAN DEFAULT TRUE,
    project_activity_status VARCHAR(50),
    soft_delete BOOLEAN DEFAULT FALSE,
    remainder_sent_date DATE DEFAULT NULL,

    -- Split-up hours (nullable initially)
    modelling_hours DECIMAL(10,2),
    checking_hours DECIMAL(10,2),
    detailing_hours DECIMAL(10,2),
    study_hours DECIMAL(10,2),
    extra_hours DECIMAL(10,2),

    -- Time tracking for split-ups
    modelling_time DECIMAL(10,2) DEFAULT 0.00,
    checking_time DECIMAL(10,2) DEFAULT 0.00,
    detailing_time DECIMAL(10,2) DEFAULT 0.00,
    study_hours_tracking DECIMAL(10,2) DEFAULT 0.00,
    extra_hours_tracking DECIMAL(10,2) DEFAULT 0.00
);
