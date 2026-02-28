package com.example.project_tracking.Model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assigned_work")
public class AssignedWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private Employee assignedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    private String description; // What manager typed
    private LocalDate assignedDate = LocalDate.now();
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED

    @OneToMany(mappedBy = "assignedWork", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkDetails> workLogs = new ArrayList<>();

    private boolean isDeleted=false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Employee getManager() {
        return manager;
    }

    public void setManager(Employee manager) {
        this.manager = manager;
    }

    public Employee getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Employee assignedBy) {
        this.assignedBy = assignedBy;
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<WorkDetails> getWorkLogs() {
        return workLogs;
    }

    public void setWorkLogs(List<WorkDetails> workLogs) {
        this.workLogs = workLogs;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean delete) {
        isDeleted = delete;
    }

    @Override
    public String toString() {
        return "AssignedWork{" +
                "id=" + id +
                ", project=" + project +
                ", employee=" + employee +
                ", manager=" + manager +
                ", assignedBy=" + assignedBy +
                ", activity=" + activity +
                ", description='" + description + '\'' +
                ", assignedDate=" + assignedDate +
                ", status='" + status + '\'' +
                ", workLogs=" + workLogs +
                ", isDeleted=" + isDeleted +
                '}';
    }
}

