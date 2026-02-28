package com.example.project_tracking.DTO;


import java.util.List;
import com.example.project_tracking.Model.Project;

public class ProjectAssignmentRequestDTO {

    private Long project_id;
    private List<Long> employeeIds;

    public Long getProject_id() {
        return project_id;
    }

    public void setProject_id(Long project_id) {
        this.project_id = project_id;
    }

    public List<Long> getEmployeeIds() {
        return employeeIds;
    }

    public void setEmployeeIds(List<Long> employeeIds) {
        this.employeeIds = employeeIds;
    }
}

