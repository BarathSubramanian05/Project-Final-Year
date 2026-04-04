CREATE TABLE user_roles (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,

                            CONSTRAINT fk_user
                                FOREIGN KEY (user_id) REFERENCES employee(emp_id),

                            CONSTRAINT fk_role
                                FOREIGN KEY (role_id) REFERENCES roles(id),

                            CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);