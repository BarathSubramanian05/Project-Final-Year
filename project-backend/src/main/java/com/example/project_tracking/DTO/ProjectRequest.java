package com.example.project_tracking.DTO;

import org.hibernate.id.BulkInsertionCapableIdentifierGenerator;

import java.math.BigDecimal;

public class ProjectRequest {
    private Long id;
    private String projectName;
    private String clientName;
    private BigDecimal assignedHours;
    private BigDecimal modellingHours;
    private BigDecimal checkingHours;
    private BigDecimal detailingHours;
    private BigDecimal studyHours;
    private Long managerId;
    private boolean projectStatus;

    public ProjectRequest() {
    }

    public ProjectRequest(Long id, String projectName, String clientName, BigDecimal assignedHours, BigDecimal modellingHours, BigDecimal checkingHours, BigDecimal detailingHours, BigDecimal studyHours, Long managerId, boolean projectStatus) {
        this.id = id;
        this.projectName = projectName;
        this.clientName = clientName;
        this.assignedHours = assignedHours;
        this.modellingHours = modellingHours;
        this.checkingHours = checkingHours;
        this.detailingHours = detailingHours;
        this.studyHours = studyHours;
        this.managerId = managerId;
        this.projectStatus = projectStatus;
    }

    public BigDecimal getStudyHours() {
        return studyHours;
    }

    public void setStudyHours(BigDecimal studyHours) {
        this.studyHours = studyHours;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public BigDecimal getAssignedHours() {
        return assignedHours;
    }

    public void setAssignedHours(BigDecimal assignedHours) {
        this.assignedHours = assignedHours;
    }

    public BigDecimal getModellingHours() {
        return modellingHours;
    }

    public void setModellingHours(BigDecimal modellingHours) {
        this.modellingHours = modellingHours;
    }

    public BigDecimal getCheckingHours() {
        return checkingHours;
    }

    public void setCheckingHours(BigDecimal checkingHours) {
        this.checkingHours = checkingHours;
    }

    public BigDecimal getDetailingHours() {
        return detailingHours;
    }

    public void setDetailingHours(BigDecimal detailingHours) {
        this.detailingHours = detailingHours;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public boolean isProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(boolean projectStatus) {
        this.projectStatus = projectStatus;
    }
}
