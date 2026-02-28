package com.example.project_tracking.DTO;

import java.time.LocalDate;

public class AssignedWorkResponse {

    private Long id;
    private Long projectId;
    private String projectName;
    private Long employeeId;
    private String employeeName;
    private Long managerId;
    private String managerName;
    private Long assignedById;
    private String assignedByName;
    private Long activityId;
    private String activityName;
    private String description;
    private LocalDate assignedDate;
    private String status;
    private String projectActivityStatus;

    public AssignedWorkResponse(Long id, Long projectId, String projectName, Long employeeId, String employeeName, Long managerId, String managerName, Long assignedById, String assignedByName, Long activityId, String activityName, String description, LocalDate assignedDate, String status, String projectActivityStatus) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.managerId = managerId;
        this.managerName = managerName;
        this.assignedById = assignedById;
        this.assignedByName = assignedByName;
        this.activityId = activityId;
        this.activityName = activityName;
        this.description = description;
        this.assignedDate = assignedDate;
        this.status = status;
        this.projectActivityStatus = projectActivityStatus;
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Long getAssignedById() { return assignedById; }
    public void setAssignedById(Long assignedById) { this.assignedById = assignedById; }

    public String getAssignedByName() { return assignedByName; }
    public void setAssignedByName(String assignedByName) { this.assignedByName = assignedByName; }

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProjectActivityStatus() {
        return projectActivityStatus;
    }

    public void setProjectActivityStatus(String projectActivityStatus) {
        this.projectActivityStatus = projectActivityStatus;
    }
}

