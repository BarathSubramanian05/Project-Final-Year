package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long> {
    List<Project> findByManagerId(Long managerId);
    List<Project> findByManagerIdAndProjectStatusTrue(Long managerId);
    List<Project> findByManagerIdAndProjectStatusFalse(Long managerId);
    List<Project> findByProjectStatusFalse();
    List<Project> findByTlId(Long tlId);
    @Query("SELECT p FROM Project p " +
            "WHERE p.startDate = :tomorrow " +
            "AND p.tlId IS NULL " +
            "AND p.workingHours = 0.0 " +
            "AND (p.remainderSentDate IS NULL OR p.remainderSentDate <> :today)")
    List<Project> findProjectsForPreStartReminder(@Param("today") LocalDate today,
                                                  @Param("tomorrow") LocalDate tomorrow);

    @Query("SELECT p FROM Project p " +
            "WHERE p.startDate < :today " +
            "AND p.tlId IS NULL " +
            "AND p.workingHours = 0.0 " +
            "AND (p.remainderSentDate IS NULL OR p.remainderSentDate <> :today)")
    List<Project> findDelayedProjects(@Param("today") LocalDate today);



}
