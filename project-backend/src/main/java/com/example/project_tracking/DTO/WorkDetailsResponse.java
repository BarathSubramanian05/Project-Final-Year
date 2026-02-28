package com.example.project_tracking.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class WorkDetailsResponse {
        private Long id;
        private String employeeName;
        private long employeeId;
        private String managerName;
        private long managerId;
        private String projectName;
        private String activityName;
        private LocalDate date;
        private Double workHours;
        private LocalTime startTime;
        private LocalTime endTime;
        private String projectActivity;
        private String assignedWork;
        private String status;
        private String remarks;
        private Long projectId;
        private Long activityId;
        private Long assignedWorkId;

    public WorkDetailsResponse(Long id, String employeeName, String managerName, String projectName, String activityName, LocalDate date, Double workHours, LocalTime startTime, LocalTime endTime, String projectActivity, String assignedWork, String status, String remarks) {
        this.id = id;
        this.employeeName = employeeName;
        this.managerName = managerName;
        this.projectName = projectName;
        this.activityName = activityName;
        this.date = date;
        this.workHours = workHours;
        this.startTime = startTime;
        this.endTime = endTime;
        this.projectActivity = projectActivity;
        this.assignedWork = assignedWork;
        this.status = status;
        this.remarks = remarks;
    }

    public WorkDetailsResponse(Long id, String employeeName, String managerName, String projectName, String activityName, LocalDate date, Double workHours, LocalTime startTime, LocalTime endTime, String projectActivity, String assignedWork, String status, String remarks, Long projectId, Long activityId) {
        this.id = id;
        this.employeeName = employeeName;
        this.managerName = managerName;
        this.projectName = projectName;
        this.activityName = activityName;
        this.date = date;
        this.workHours = workHours;
        this.startTime = startTime;
        this.endTime = endTime;
        this.projectActivity = projectActivity;
        this.assignedWork = assignedWork;
        this.status = status;
        this.remarks = remarks;
        this.projectId = projectId;
        this.activityId = activityId;
    }

    public WorkDetailsResponse(Long id, String employeeName, long employeeId, String managerName, long managerId, String projectName, String activityName, LocalDate date, Double workHours, LocalTime startTime, LocalTime endTime, String projectActivity, String assignedWork, String status, String remarks, Long projectId, Long activityId,Long assignedWorkId) {
        this.id = id;
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.managerName = managerName;
        this.managerId = managerId;
        this.projectName = projectName;
        this.activityName = activityName;
        this.date = date;
        this.workHours = workHours;
        this.startTime = startTime;
        this.endTime = endTime;
        this.projectActivity = projectActivity;
        this.assignedWork = assignedWork;
        this.status = status;
        this.remarks = remarks;
        this.projectId = projectId;
        this.activityId = activityId;
        this.assignedWorkId = assignedWorkId;
    }

    public Long getAssignedWorkId() {
        return assignedWorkId;
    }

    public void setAssignedWorkId(Long assignedWorkId) {
        this.assignedWorkId = assignedWorkId;
    }

    public long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(long employeeId) {
        this.employeeId = employeeId;
    }

    public long getManagerId() {
        return managerId;
    }

    public void setManagerId(long managerId) {
        this.managerId = managerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getWorkHours() {
        return workHours;
    }

    public void setWorkHours(Double workHours) {
        this.workHours = workHours;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getProjectActivity() {
        return projectActivity;
    }

    public void setProjectActivity(String projectActivity) {
        this.projectActivity = projectActivity;
    }

    public String getAssignedWork() {
        return assignedWork;
    }

    public void setAssignedWork(String assignedWork) {
        this.assignedWork = assignedWork;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long activityId) {
        this.activityId = activityId;
    }
}
