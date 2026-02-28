package com.example.project_tracking.Service;

import com.example.project_tracking.DTO.DataTransfer;
import com.example.project_tracking.DTO.ProjectAssignmentRequestDTO;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Model.ProjectAssignment;
import com.example.project_tracking.Model.WorkDetails;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.ProjectAssignmentRepository;
import com.example.project_tracking.Repository.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public ProjectAssignmentService(ProjectAssignmentRepository projectAssignmentRepository,ProjectRepository projectRepository,EmployeeRepository employeeRepository) {
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<ProjectAssignment> assignProjectToEmployees(ProjectAssignmentRequestDTO dto) {
        Project project = projectRepository.findById(dto.getProject_id()).orElseThrow(() -> new RuntimeException("No project Found"));
        List<Long> employeeIds = dto.getEmployeeIds();
        List<ProjectAssignment> assignments = new ArrayList<>();

        for (Long empId : employeeIds) {
            Employee employee = employeeRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

            ProjectAssignment assignment = new ProjectAssignment();
            assignment.setEmployee(employee);
            assignment.setProject(project);

            // Manager already in Project, so no need to set manually
            assignments.add(assignment);
        }

        return projectAssignmentRepository.saveAll(assignments);
    }

//    public List<Employee> getEmployeesByProject(Long projectId) {
//        System.out.println(projectId);
//        Project project = projectRepository.findById(projectId).orElseThrow(()-> new RuntimeException("No project found"));
//        System.out.println(project.toString());
//        Employee tl = null;
//        if(project.getTlId()!=null) {
//            tl = employeeRepository.findById(project.getTlId()).orElseThrow(()-> new RuntimeException("No TL - employee found"));
//        }
//        Employee manager = employeeRepository.findById(project.getManagerId()).orElseThrow(()-> new RuntimeException("No TL - employee found"));
//        List<ProjectAssignment> assignments = projectAssignmentRepository.findByProject_Id(projectId);
//        List<Employee> dto =  new ArrayList<>(assignments.stream()
//                .map(ProjectAssignment::getEmployee)
//                .toList());
//        if(tl!=null) dto.addFirst(tl);
//        return dto;
//    }

    public List<DataTransfer> getEmployeesByProject(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("No project found"));

        Employee tl = null;
        if (project.getTlId() != null) {
            tl = employeeRepository.findById(project.getTlId())
                    .orElseThrow(() -> new RuntimeException("No TL found"));
        }

        Employee manager = employeeRepository.findById(project.getManagerId())
                .orElseThrow(() -> new RuntimeException("No Manager found"));

        List<ProjectAssignment> assignments =
                projectAssignmentRepository.findByProject_Id(projectId);

        List<DataTransfer> result = new ArrayList<>();

        // ✅ Add assigned employees (WITH assignmentId)
        for (ProjectAssignment pa : assignments) {
            Employee e = pa.getEmployee();

            result.add(new DataTransfer(
                    pa.getAssignmentId(),          // ✅ IMPORTANT
                    e.getEmpId(),
                    e.getName(),
                    e.getDesignation(),
                    e.getManager(),
                    e.getTL(),
                    e.getReportingTo(),
                    e.getDesignation()
            ));
        }

        // ✅ Add TL separately (NO assignmentId → cannot be deleted)
        if (tl != null) {
            result.add(0, new DataTransfer(
                    null,                          // ❌ no assignment
                    tl.getEmpId(),
                    tl.getName(),
                    tl.getDesignation(),
                    tl.getManager(),
                    true,
                    tl.getReportingTo(),
                    "TL"
            ));
        }

        return result;
    }


    public List<Project> getProjectsByEmployee(Long employeeId) {
        List<ProjectAssignment> assignments = projectAssignmentRepository.findByEmployee_EmpId(employeeId);
        return assignments.stream()
                .map(ProjectAssignment::getProject)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteWorkDetailsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("No work IDs provided for deletion");
        }

        List<ProjectAssignment> works = projectAssignmentRepository.findAllById(ids);

        if (works.size() != ids.size()) {
            throw new RuntimeException("Some work IDs were not found in the database");
        }
        projectAssignmentRepository.deleteAll(works);
    }
    public List<Employee> getEmployeesNotInProject(Long projectId, Long reportingToId) {

        // Fetch project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Fetch reporting manager / TL
        Employee reportingTo = employeeRepository.findById(reportingToId)
                .orElseThrow(() -> new RuntimeException("Reporting employee not found"));

        // Get assigned employees for the project
        List<ProjectAssignment> assignments =
                projectAssignmentRepository.findByProject_Id(projectId);

        List<Long> assignedEmpIds = assignments.stream()
                .map(pa -> pa.getEmployee().getEmpId())
                .toList();

        // If no one is assigned yet → return all under reportingTo
        if (assignedEmpIds.isEmpty()) {
            return employeeRepository.findByReportingTo(reportingTo);
        }

        // Fetch employees NOT in project under reportingTo
        return employeeRepository.findByReportingToAndEmpIdNotIn(
                reportingTo, assignedEmpIds
        );
    }

}
