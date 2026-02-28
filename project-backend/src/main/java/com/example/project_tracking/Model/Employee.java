package com.example.project_tracking.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @Column(name = "emp_id", unique = true, nullable = false)
    private Long empId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "designation")
    private String designation;

    @Column(name = "is_manager")
    private Boolean isManager = false;

    @Column(name = "is_tl")
    private Boolean isTL = false;

    @ManyToOne
    @JoinColumn(name = "reporting_to")
    private Employee reportingTo; // Self-reference for manager

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password; // Ideally store hashed passwords

    @Column(name = "category",nullable = false)
    private String designationCategory;

    @Column(name="soft_delete")
    private Boolean softDelete = false;


    public Employee() {
    }

    public Long getEmpId() {
        return empId;
    }

    public void setEmpId(Long empId) {
        this.empId = empId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Boolean getIsManager() {
        return isManager;
    }

    public void setIsManager(Boolean manager) {
        isManager = manager;
    }

    public Boolean getIsTL() {
        return isTL;
    }

    public void setIsTL(Boolean TL) {
        isTL = TL;
    }

    public Employee getReportingTo() {
        return reportingTo;
    }

    public void setReportingTo(Employee reportingTo) {
        this.reportingTo = reportingTo;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public Boolean getManager() {
        return isManager;
    }

    public void setManager(Boolean manager) {
        isManager = manager;
    }

    public Boolean getTL() {
        return isTL;
    }

    public void setTL(Boolean TL) {
        isTL = TL;
    }

    public String getDesignationCategory() {
        return designationCategory;
    }

    public void setDesignationCategory(String designationCategory) {
        this.designationCategory = designationCategory;
    }

    @Override
    public String toString() {
        return "Employee{" +
                ", empId='" + empId + '\'' +
                ", name='" + name + '\'' +
                ", designation='" + designation + '\'' +
                ", isManager=" + isManager +
                ", isTL=" + isTL +
                ", reportingTo=" + reportingTo +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    public Boolean getSoftDelete() {
        return softDelete;
    }

    public void setSoftDelete(Boolean softDelete) {
        this.softDelete = softDelete;
    }
}
