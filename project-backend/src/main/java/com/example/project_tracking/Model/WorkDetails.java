package com.example.project_tracking.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "work_details")

public class WorkDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_work_id")
    private AssignedWork assignedWorkId;

    private LocalDate date;
    private Double workHours;
    private LocalTime startTime;
    private LocalTime endTime;
    private String projectActivity;
    private String assignedWork;
    private String status;
    private String remarks;
    private Boolean is_Deleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public AssignedWork getAssignedWorkId() {
        return assignedWorkId;
    }

    public void setAssignedWorkId(AssignedWork assignedWorkId) {
        this.assignedWorkId = assignedWorkId;
    }

    public Boolean getIs_Deleted() {
        return is_Deleted;
    }

    public void setIs_Deleted(Boolean is_Deleted) {
        this.is_Deleted = is_Deleted;
    }

    @Override
    public String toString() {
        return "WorkDetails{" +
                "id=" + id +
                ", date=" + date +
                ", workHours=" + workHours +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", projectActivity='" + projectActivity + '\'' +
                ", assignedWork='" + assignedWork + '\'' +
                ", status='" + status + '\'' +
                ", remarks='" + remarks + '\'' +
                '}';
    }
}

