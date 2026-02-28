package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.AssignedWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignedWorkRepository extends JpaRepository<AssignedWork, Long> {

    // Get all assigned works for a specific employee
    List<AssignedWork> findByEmployeeEmpId(Long empId);

    // Get all assigned works under a project
    List<AssignedWork> findByProjectId(Long projectId);

    List<AssignedWork> findByManager_EmpId(Long managerId);

    List<AssignedWork> findByProject_IdAndEmployee_EmpId(Long projectId, Long employeeId);

    List<AssignedWork> findByProject_IdAndEmployee_EmpIdAndStatusIgnoreCase(Long projectId, Long employeeId, String status);

    Optional<AssignedWork> findByEmployee_EmpIdAndManager_EmpIdAndProject_IdAndActivity_Id(Long empId, Long mgrId, Long projectId, Long activityId);
}

