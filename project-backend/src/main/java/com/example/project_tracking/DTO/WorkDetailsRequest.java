package com.example.project_tracking.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class WorkDetailsRequest {
    private Long employeeId;
    private Long managerId;
    private Long projectId;
    private Long activityId;
    private LocalDate date;
    private Double workHours;
    private LocalTime startTime;
    private LocalTime endTime;
    private String projectActivity;
    private String assignedWork;
    private String status;
    private String remarks;
    private Long assignedWorkId;

    public Long getAssignedWorkId() {
        return assignedWorkId;
    }

    public void setAssignedWorkId(Long assignedWorkId) {
        this.assignedWorkId = assignedWorkId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
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

    @Override
    public String toString() {
        return "WorkDetailsRequest{" +
                "employeeId=" + employeeId +
                ", managerId=" + managerId +
                ", projectId=" + projectId +
                ", activityId=" + activityId +
                ", date=" + date +
                ", workHours=" + workHours +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", projectActivity='" + projectActivity + '\'' +
                ", assignedWork='" + assignedWork + '\'' +
                ", status='" + status + '\'' +
                ", remarks='" + remarks + '\'' +
                ", assignedWorkId=" + assignedWorkId +
                '}';
    }
}