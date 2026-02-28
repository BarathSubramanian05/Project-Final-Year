package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {
    List<ProjectAssignment> findByProject_Id(Long projectId);
    List<ProjectAssignment> findByEmployee_EmpId(Long employeeId);
    void deleteAllById(Iterable<? extends Long> ids);
}
