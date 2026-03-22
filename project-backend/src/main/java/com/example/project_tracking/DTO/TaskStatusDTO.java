package com.example.project_tracking.DTO;

public class TaskStatusDTO {

    private String status;
    private Long count;

    public TaskStatusDTO(String status, Long count) {
        this.status = status;
        this.count = count;
    }

    public String getStatus() { return status; }
    public Long getCount() { return count; }
}