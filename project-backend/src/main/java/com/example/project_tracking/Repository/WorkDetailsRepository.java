package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.AssignedWork;
import com.example.project_tracking.Model.WorkDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkDetailsRepository extends JpaRepository<WorkDetails,Long> {

        // Fetch all work details by employee ID
        List<WorkDetails> findByAssignedWorkId_Employee_EmpId(Long employeeId);

        // Fetch all work details by manager ID
        List<WorkDetails> findByAssignedWorkId_Manager_EmpId(Long managerId);

        // Fetch all work details by project ID
        List<WorkDetails> findByAssignedWorkId_Project_Id(Long projectId);

        // Fetch all work details by activity ID
        List<WorkDetails> findByAssignedWorkId_Activity_Id(Long activityId);

        // Latest running work entry (endTime = null)
        Optional<WorkDetails> findTopByAssignedWorkId_Employee_EmpIdAndEndTimeIsNullOrderByIdDesc(Long employeeId);

        Optional<WorkDetails> findTopByAssignedWorkIdOrderByIdDesc(AssignedWork assignedWorkId);

        // By employee and project
        @Query("""
           SELECT w FROM WorkDetails w
           WHERE w.assignedWorkId.employee.empId = :employeeId
             AND w.assignedWorkId.project.id = :projectId
           """)
        List<WorkDetails> findByEmployeeAndProject(@Param("employeeId") Long employeeId,
                                                   @Param("projectId") Long projectId);

        // By manager and project
        @Query("""
           SELECT w FROM WorkDetails w
           WHERE w.assignedWorkId.manager.empId = :managerId
             AND w.assignedWorkId.project.id = :projectId
           """)
        List<WorkDetails> findByManagerAndProject(@Param("managerId") Long managerId,
                                                  @Param("projectId") Long projectId);

        // By project and activity
        @Query("""
           SELECT w FROM WorkDetails w
           WHERE w.assignedWorkId.project.id = :projectId
             AND w.assignedWorkId.activity.id = :activityId
           """)
        List<WorkDetails> findByProjectAndActivity(@Param("projectId") Long projectId,
                                                   @Param("activityId") Long activityId);

        // Only work under active projects
        @Query("""
           SELECT w FROM WorkDetails w
           WHERE w.assignedWorkId.project.projectStatus = true
           """)
        List<WorkDetails> findAllByActiveProjectStatus();

    @Query("""
       SELECT w FROM WorkDetails w
       JOIN FETCH w.assignedWorkId aw
       JOIN FETCH aw.project
       JOIN FETCH aw.employee
       JOIN FETCH aw.activity
       WHERE aw.employee.empId = :employeeId
       """)
    List<WorkDetails> findAllByEmployeeWithRelations(@Param("employeeId") Long employeeId);

    @Query("""
    SELECT w FROM WorkDetails w 
    WHERE w.assignedWorkId.employee.empId = :employeeId 
      AND w.endTime IS NULL 
    ORDER BY w.id DESC
    """)
    Optional<WorkDetails> findTopByEmployeeEmpIdAndEndTimeIsNullOrderByIdDesc(@Param("employeeId") Long employeeId);

}
