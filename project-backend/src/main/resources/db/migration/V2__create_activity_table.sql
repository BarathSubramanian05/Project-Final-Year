CREATE TABLE activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    main_type VARCHAR(100),
    soft_delete BOOLEAN DEFAULT FALSE
);
