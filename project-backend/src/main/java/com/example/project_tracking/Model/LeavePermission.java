package com.example.project_tracking.Model;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "leave_permission")
public class LeavePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;  // The employee who applies

    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    private Employee manager;   // The reporting manager

    private String type;              // Leave / Permission
    private String leaveDuration;     // One Day / Multiple Days
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double leaveDays;
    private String leaveType;         // CL / SL / LOP
    @Column(columnDefinition = "TEXT")
    private String reason;
    private LocalTime permissionInTime;
    private LocalTime permissionOutTime;
    private Double permissionHours;
    private Integer permissionMinutes;
    private LocalDate appliedDate;
    private String status = "Pending";
    private boolean isActive=true;// Default
    private String leaveHalf;

    public String getLeaveHalf() {
        return leaveHalf;
    }

    public void setLeaveHalf(String leaveHalf) {
        this.leaveHalf = leaveHalf;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public Employee getManager() { return manager; }
    public void setManager(Employee manager) { this.manager = manager; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLeaveDuration() { return leaveDuration; }
    public void setLeaveDuration(String leaveDuration) { this.leaveDuration = leaveDuration; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public Double getLeaveDays() { return leaveDays; }
    public void setLeaveDays(Double leaveDays) { this.leaveDays = leaveDays; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalTime getPermissionInTime() { return permissionInTime; }
    public void setPermissionInTime(LocalTime permissionInTime) { this.permissionInTime = permissionInTime; }

    public LocalTime getPermissionOutTime() { return permissionOutTime; }
    public void setPermissionOutTime(LocalTime permissionOutTime) { this.permissionOutTime = permissionOutTime; }

    public Double getPermissionHours() { return permissionHours; }
    public void setPermissionHours(Double permissionHours) { this.permissionHours = permissionHours; }

    public Integer getPermissionMinutes() { return permissionMinutes; }
    public void setPermissionMinutes(Integer permissionMinutes) { this.permissionMinutes = permissionMinutes; }

    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public String toString() {
        return "LeavePermission{" +
                "id=" + id +
                ", employee=" + employee +
                ", manager=" + manager +
                ", type='" + type + '\'' +
                ", leaveDuration='" + leaveDuration + '\'' +
                ", fromDate=" + fromDate +
                ", toDate=" + toDate +
                ", leaveDays=" + leaveDays +
                ", leaveType='" + leaveType + '\'' +
                ", reason='" + reason + '\'' +
                ", permissionInTime=" + permissionInTime +
                ", permissionOutTime=" + permissionOutTime +
                ", permissionHours=" + permissionHours +
                ", permissionMinutes=" + permissionMinutes +
                ", appliedDate=" + appliedDate +
                ", status='" + status + '\'' +
                ", isActive=" + isActive +
                ", leaveHalf='" + leaveHalf + '\'' +
                '}';
    }
}

