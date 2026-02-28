CREATE TABLE exception_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exception_type VARCHAR(255) NOT NULL,
    message VARCHAR(1000),
    stack_trace TEXT,
    endpoint VARCHAR(500),
    http_method VARCHAR(10),
    request_params VARCHAR(500),
    timestamp DATETIME,
    is_deleted BOOLEAN DEFAULT FALSE
);