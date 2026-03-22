package com.example.project_tracking.DTO;

public class EmployeeWorkHoursDTO {

    private String employeeName;
    private Double totalHours;

    public EmployeeWorkHoursDTO(String employeeName, Double totalHours) {
        this.employeeName = employeeName;
        this.totalHours = totalHours;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public Double getTotalHours() {
        return totalHours;
    }
}
