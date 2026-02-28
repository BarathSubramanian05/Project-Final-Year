package com.example.project_tracking.Repository;


import com.example.project_tracking.Model.ExceptionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExceptionLogRepository extends JpaRepository<ExceptionLog, Long> {

    List<ExceptionLog> findByExceptionType(String exceptionType);

    List<ExceptionLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    List<ExceptionLog> findByEndpoint(String endpoint);
}
