package com.example.project_tracking.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "exception_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String exceptionType;

    @Column(length = 1000)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String stackTrace;

    @Column(length = 500)
    private String endpoint;

    @Column(length = 10)
    private String httpMethod;

    @Column(length = 500)
    private String requestParams;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
