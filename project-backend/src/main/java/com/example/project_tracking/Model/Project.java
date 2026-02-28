    package com.example.project_tracking.Model;
    import jakarta.persistence.*;
    import java.math.BigDecimal;
    import java.time.LocalDate;
    import java.time.LocalTime;

    @Entity
    @Table(name = "project")
    public class Project {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String projectName;

        private String clientName;

        @Column(nullable = false)
        private Long managerId;

        private Long tlId;

        private BigDecimal assignedHours;
        private BigDecimal workingHours;
        private LocalDate assignedDate;

        private Boolean projectStatus = true;
        private Boolean softDelete = false;

        // Split-up hours
        private BigDecimal modellingHours;
        private BigDecimal checkingHours;
        private BigDecimal detailingHours;

        // Time tracking for split-ups
        private BigDecimal modellingTime;
        private BigDecimal checkingTime;
        private BigDecimal detailingTime;

        // Project timeline
        private LocalDate startDate;
        private LocalDate completedDate;

        // Study section
        private BigDecimal studyHours;
        private BigDecimal studyHoursTracking;

        // Extra work section
        private BigDecimal extraHours;
        private BigDecimal extraHoursTracking;

        @Column(name = "project_activity_status")
        private String projectActivityStatus;

        @Column(name = "remainder_sent_date")
        private LocalDate remainderSentDate;

        // Idle project flag

        public Project() {
        }

        public Project(Long id, String projectName, String clientName, Long managerId, BigDecimal assignedHours, BigDecimal workingHours, LocalDate assignedDate, Boolean projectStatus, Boolean softDelete, BigDecimal modellingHours, BigDecimal checkingHours, BigDecimal detailingHours, BigDecimal modellingTime, BigDecimal checkingTime, BigDecimal detailingTime) {
            this.id = id;
            this.projectName = projectName;
            this.clientName = clientName;
            this.managerId = managerId;
            this.assignedHours = assignedHours;
            this.workingHours = workingHours;
            this.assignedDate = assignedDate;
            this.projectStatus = projectStatus;
            this.softDelete = softDelete;
            this.modellingHours = modellingHours;
            this.checkingHours = checkingHours;
            this.detailingHours = detailingHours;
            this.modellingTime = modellingTime;
            this.checkingTime = checkingTime;
            this.detailingTime = detailingTime;
        }

        public Project(Long id, String projectName, String clientName, Long managerId, BigDecimal assignedHours, BigDecimal workingHours, LocalDate assignedDate, Boolean projectStatus, Boolean softDelete) {
            this.id = id;
            this.projectName = projectName;
            this.clientName = clientName;
            this.managerId = managerId;
            this.assignedHours = assignedHours;
            this.workingHours = workingHours;
            this.assignedDate = assignedDate;
            this.projectStatus = projectStatus;
            this.softDelete = softDelete;
        }

        public Long getTlId() {
            return tlId;
        }

        public void setTlId(Long tlId) {
            this.tlId = tlId;
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

        public Long getManagerId() {
            return managerId;
        }

        public void setManagerId(Long managerId) {
            this.managerId = managerId;
        }

        public BigDecimal getAssignedHours() {
            return assignedHours;
        }

        public void setAssignedHours(BigDecimal assignedHours) {
            this.assignedHours = assignedHours;
        }

        public BigDecimal getWorkingHours() {
            return workingHours;
        }

        public void setWorkingHours(BigDecimal workingHours) {
            this.workingHours = workingHours;
        }

        public LocalDate getAssignedDate() {
            return assignedDate;
        }

        public void setAssignedDate(LocalDate assignedDate) {
            this.assignedDate = assignedDate;
        }

        public Boolean getProjectStatus() {
            return projectStatus;
        }

        public void setProjectStatus(Boolean projectStatus) {
            this.projectStatus = projectStatus;
        }

        public Boolean getSoftDelete() {
            return softDelete;
        }

        public void setSoftDelete(Boolean softDelete) {
            this.softDelete = softDelete;
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

        public BigDecimal getModellingTime() {
            return modellingTime;
        }

        public void setModellingTime(BigDecimal modellingTime) {
            this.modellingTime = modellingTime;
        }

        public BigDecimal getCheckingTime() {
            return checkingTime;
        }

        public void setCheckingTime(BigDecimal checkingTime) {
            this.checkingTime = checkingTime;
        }

        public BigDecimal getDetailingTime() {
            return detailingTime;
        }

        public void setDetailingTime(BigDecimal detailingTime) {
            this.detailingTime = detailingTime;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getCompletedDate() {
            return completedDate;
        }

        public void setCompletedDate(LocalDate completedDate) {
            this.completedDate = completedDate;
        }

        public BigDecimal getStudyHours() {
            return studyHours;
        }

        public void setStudyHours(BigDecimal studyHours) {
            this.studyHours = studyHours;
        }

        public BigDecimal getStudyHoursTracking() {
            return studyHoursTracking;
        }

        public void setStudyHoursTracking(BigDecimal studyHoursTracking) {
            this.studyHoursTracking = studyHoursTracking;
        }

        public BigDecimal getExtraHours() {
            return extraHours;
        }

        public void setExtraHours(BigDecimal extraHours) {
            this.extraHours = extraHours;
        }

        public BigDecimal getExtraHoursTracking() {
            return extraHoursTracking;
        }

        public void setExtraHoursTracking(BigDecimal extraHoursTracking) {
            this.extraHoursTracking = extraHoursTracking;
        }

        public String getProjectActivityStatus() {
            return projectActivityStatus;
        }

        public void setProjectActivityStatus(String projectActivityStatus) {
            this.projectActivityStatus = projectActivityStatus;
        }

        public LocalDate getRemainderSentDate() {
            return remainderSentDate;
        }

        public void setRemainderSentDate(LocalDate remainderSentDate) {
            this.remainderSentDate = remainderSentDate;
        }

        @Override
        public String toString() {
            return "Project{" +
                    "id=" + id +
                    ", projectName='" + projectName + '\'' +
                    ", clientName='" + clientName + '\'' +
                    ", managerId=" + managerId +
                    ", tlId=" + tlId +
                    ", assignedHours=" + assignedHours +
                    ", workingHours=" + workingHours +
                    ", assignedDate=" + assignedDate +
                    ", projectStatus=" + projectStatus +
                    ", softDelete=" + softDelete +
                    ", modellingHours=" + modellingHours +
                    ", checkingHours=" + checkingHours +
                    ", detailingHours=" + detailingHours +
                    ", modellingTime=" + modellingTime +
                    ", checkingTime=" + checkingTime +
                    ", detailingTime=" + detailingTime +
                    ", startDate=" + startDate +
                    ", completedDate=" + completedDate +
                    ", studyHours=" + studyHours +
                    ", studyHoursTracking=" + studyHoursTracking +
                    ", extraHours=" + extraHours +
                    ", extraHoursTracking=" + extraHoursTracking +
                    '}';
        }
    }

