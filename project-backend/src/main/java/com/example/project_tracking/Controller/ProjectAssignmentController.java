package com.example.project_tracking.Controller;

import com.example.project_tracking.DTO.DataTransfer;
import com.example.project_tracking.DTO.ProjectAssignmentRequestDTO;
import com.example.project_tracking.DTO.ProjectResponse;
import com.example.project_tracking.DTO.ResourcesDeletion;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Model.ProjectAssignment;
import com.example.project_tracking.Service.EmployeeService;
import com.example.project_tracking.Service.ProjectAssignmentService;
import com.example.project_tracking.Service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/project-assignment")
@CrossOrigin(origins="*")
public class ProjectAssignmentController {
    private final ProjectAssignmentService projectAssignmentService;

    private final ProjectService projectService;
    private final EmployeeService employeeService;

    public ProjectAssignmentController(ProjectAssignmentService projectAssignmentService,ProjectService projectService, EmployeeService employeeService) {
        this.projectAssignmentService = projectAssignmentService;
        this.projectService = projectService;
        this.employeeService = employeeService;
    }

    @PostMapping("/assign")
    public ResponseEntity<List<ProjectAssignment>> assignProjectToMultipleEmployees(
            @RequestBody ProjectAssignmentRequestDTO dto) {
        List<ProjectAssignment> savedAssignments = projectAssignmentService.assignProjectToEmployees(dto);
        return ResponseEntity.ok(savedAssignments);
    }

    public ProjectResponse localConverting(Project project)
    {
        return projectService.convertToResponse(project);
    }

    public DataTransfer localConversion2(Employee employee)
    {
        return employeeService.convertToResponse(employee);
    }

    @GetMapping("/projects/{employeeId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByEmployee(@PathVariable Long employeeId) {
        List<Project> projects = projectAssignmentService.getProjectsByEmployee(employeeId);
        System.out.println(employeeId);
        List<ProjectResponse> projectDTOs = projects.stream()
                .map(this::localConverting)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projectDTOs);
    }

    @GetMapping("/employees/{projectId}")
    public ResponseEntity<List<DataTransfer>> getEmployeesByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                projectAssignmentService.getEmployeesByProject(projectId)
        );
    }


    @DeleteMapping("/resource-delete")
    public ResponseEntity<String> bulkDeleteWorkDetails(
            @RequestBody ResourcesDeletion request) {

        System.out.println(request.getIds().toString());

        projectAssignmentService.deleteWorkDetailsByIds(request.getIds());

        return ResponseEntity.ok("Work logs deleted successfully");
    }

    @GetMapping("/employees/not-in-project")
    public ResponseEntity<List<DataTransfer>> getEmployeesNotInProject(
            @RequestParam Long projectId,
            @RequestParam Long reportingToId) {

        List<Employee> employees =
                projectAssignmentService.getEmployeesNotInProject(projectId,reportingToId);

        List<DataTransfer> dto = employees.stream()
                .map(this::localConversion2)
                .toList();
        return ResponseEntity.ok(dto);
    }

}