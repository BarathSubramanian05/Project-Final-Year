package com.example.project_tracking.Service;


import com.example.project_tracking.DTO.AssignedWorkRequest;
import com.example.project_tracking.DTO.AssignedWorkResponse;
import com.example.project_tracking.Model.Activity;
import com.example.project_tracking.Model.AssignedWork;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Repository.ActivityRepository;
import com.example.project_tracking.Repository.AssignedWorkRepository;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class AssignedWorkService {

    @Autowired
    private AssignedWorkRepository assignedWorkRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private NotificationService notificationService;

    public AssignedWork createAssignedWork(AssignedWorkRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        Employee assignedBy = employeeRepository.findById(request.getAssignedById())
                .orElseThrow(() -> new RuntimeException("AssignedBy not found"));
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Build entity
        AssignedWork assignedWork = new AssignedWork();
        assignedWork.setEmployee(employee);
        assignedWork.setManager(manager);
        assignedWork.setAssignedBy(assignedBy);
        assignedWork.setProject(project);
        assignedWork.setActivity(activity);
        assignedWork.setDescription(request.getDescription());
        assignedWork.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        assignedWork.setAssignedDate(request.getAssignedDate() != null ? request.getAssignedDate() : java.time.LocalDate.now());
        notificationService.createNotification(
                manager.getEmpId(), // Sender → PM
                employee.getEmpId(), // Receiver → Employee
                "New Activity Assigned",
                "\"" + activity.getActivityName() + "\" is assigned in project \""
                        + project.getProjectName()
                        + "\"\nDescription: "
                        + assignedWork.getDescription(),
                "ACTIVITY_ASSIGNMENT"
        );
        return assignedWorkRepository.save(assignedWork);
    }

    public List<AssignedWorkResponse> getAllAssignedWorks() {
        return assignedWorkRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    public AssignedWorkResponse getAssignedWorkById(Long id) {
        return convertToResponse(assignedWorkRepository.findById(id).orElseThrow(()-> new RuntimeException("No assigned Work found")));
    }

    public List<AssignedWorkResponse> getAssignedWorksByEmployee(Long empId) {
        return assignedWorkRepository.findByEmployeeEmpId(empId).stream().map(this::convertToResponse).toList();
    }

    public List<AssignedWorkResponse> getAssignedWorksByProject(Long projectId) {
        return assignedWorkRepository.findByProjectId(projectId).stream().filter(p -> p.getStatus().equals("PENDING")).map(this::convertToResponse).toList();
    }

    public AssignedWorkResponse updateAssignedWorkStatus(Long id, String newStatus) {
        Optional<AssignedWork> optionalAssignedWork = assignedWorkRepository.findById(id);
        if (optionalAssignedWork.isPresent()) {
            AssignedWork work = optionalAssignedWork.get();
            work.setStatus(newStatus);
            return convertToResponse(assignedWorkRepository.save(work));
        }
        throw new RuntimeException("AssignedWork not found with ID: " + id);
    }

    public void deleteAssignedWork(Long id) {
        assignedWorkRepository.deleteById(id);
    }

    public List<AssignedWorkResponse> getActivityByEmployeeProjectStatus(Long projectId,Long empId,String status)
    {
        return assignedWorkRepository.findByProject_IdAndEmployee_EmpIdAndStatusIgnoreCase(projectId,empId,status).stream().map(this::convertToResponse).toList();
    }

    public AssignedWorkResponse convertToResponse(AssignedWork assignedWork)
    {
        return new AssignedWorkResponse( assignedWork.getId(),
                assignedWork.getProject().getId(),
                assignedWork.getProject().getProjectName(),
                assignedWork.getEmployee().getEmpId(),
                assignedWork.getEmployee().getName(),
                assignedWork.getManager().getEmpId(),
                assignedWork.getManager().getName(),
                assignedWork.getAssignedBy().getEmpId(),
                assignedWork.getAssignedBy().getName(),
                assignedWork.getActivity().getId(),
                assignedWork.getActivity().getActivityName(),
                assignedWork.getDescription(),
                assignedWork.getAssignedDate(),
                assignedWork.getStatus(),
                assignedWork.getProject().getProjectActivityStatus());
    }

    public List<AssignedWorkResponse> getAssignedWorksByManager(Long managerId) {
        return assignedWorkRepository.findByManager_EmpId(managerId).stream().map(this::convertToResponse).toList();
    }

}

