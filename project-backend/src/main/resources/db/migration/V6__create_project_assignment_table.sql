CREATE TABLE project_assignment (
  assignment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  CONSTRAINT fk_pa_project FOREIGN KEY (project_id) REFERENCES project(id),
  CONSTRAINT fk_pa_employee FOREIGN KEY (employee_id) REFERENCES employee(emp_id)
);