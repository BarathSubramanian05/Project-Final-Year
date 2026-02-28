package com.example.project_tracking.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class LeavePermissionResponse {

    private Long id;
    private String employeeName;
    private String managerName;
    private String type;
    private String leaveDuration;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double leaveDays;
    private String leaveType;
    private String reason;
    private LocalDate appliedDate;
    private LocalTime permissionInTime;
    private LocalTime permissionOutTime;
    private Double permissionHours;
    private String status;
    private boolean isActive;

    // Constructor
    public LeavePermissionResponse(Long id, String employeeName, String managerName,
                                   String type, String leaveDuration, LocalDate fromDate,
                                   LocalDate toDate, Double leaveDays, String leaveType,
                                   String reason,LocalDate appliedDate, LocalTime permissionInTime, LocalTime permissionOutTime,
                                   Double permissionHours, String status, boolean isActive) {
        this.id = id;
        this.employeeName = employeeName;
        this.managerName = managerName;
        this.type = type;
        this.leaveDuration = leaveDuration;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.leaveDays = leaveDays;
        this.leaveType = leaveType;
        this.reason = reason;
        this.appliedDate = appliedDate;
        this.permissionInTime = permissionInTime;
        this.permissionOutTime = permissionOutTime;
        this.permissionHours = permissionHours;
        this.status = status;
        this.isActive = isActive;
    }

    // Getters and setters (or use Lombok @Data)
    public Long getId() { return id; }
    public String getEmployeeName() { return employeeName; }
    public String getManagerName() { return managerName; }
    public String getType() { return type; }
    public String getLeaveDuration() { return leaveDuration; }
    public LocalDate getFromDate() { return fromDate; }
    public LocalDate getToDate() { return toDate; }
    public Double getLeaveDays() { return leaveDays; }
    public String getLeaveType() { return leaveType; }
    public String getReason() { return reason; }
    public LocalTime getPermissionInTime() { return permissionInTime; }
    public LocalTime getPermissionOutTime() { return permissionOutTime; }
    public Double getPermissionHours() { return permissionHours; }
    public String getStatus() { return status; }
    public boolean isActive() { return isActive; }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }
}

