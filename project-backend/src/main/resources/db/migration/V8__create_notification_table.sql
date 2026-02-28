-- Create Notification table
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE
);


CREATE INDEX idx_notification_receiver ON notification(receiver_id);
CREATE INDEX idx_notification_sender ON notification(sender_id);
CREATE INDEX idx_notification_created_at ON notification(created_at);
