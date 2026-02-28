package com.example.project_tracking.Model;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "leave_balance")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private double casualLeaves;
    private double sickLeaves;
    private double marriageLeaves;
    private double maternityLeaves;
    private int year;
    private double permissionBalance;

    public LeaveBalance() {
    }

    public LeaveBalance(Employee employee) {
        this.employee = employee;
        casualLeaves = 12;
        sickLeaves = 8;
        marriageLeaves = 14;
        maternityLeaves = 14;
        year = LocalDate.now().getYear();
        permissionBalance = 4.0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public double getCasualLeaves() { return casualLeaves; }
    public void setCasualLeaves(double casualLeaves) { this.casualLeaves = casualLeaves; }

    public double getSickLeaves() { return sickLeaves; }
    public void setSickLeaves(double sickLeaves) { this.sickLeaves = sickLeaves; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getMarriageLeaves() {
        return marriageLeaves;
    }

    public void setMarriageLeaves(double marriageLeaves) {
        this.marriageLeaves = marriageLeaves;
    }

    public double getMaternityLeaves() {
        return maternityLeaves;
    }

    public void setMaternityLeaves(double maternityLeaves) {
        this.maternityLeaves = maternityLeaves;
    }

    public double getPermissionBalance() {
        return permissionBalance;
    }

    public void setPermissionBalance(double permissionHoursBalance) {
        this.permissionBalance = permissionHoursBalance;
    }
}

