package com.example.project_tracking.DTO;

import java.time.LocalDate;

public class DailyProductivityDTO {

    private LocalDate date;
    private Double hours;

    public DailyProductivityDTO(LocalDate date, Double hours) {
        this.date = date;
        this.hours = hours;
    }

    public LocalDate getDate() { return date; }
    public Double getHours() { return hours; }
}
