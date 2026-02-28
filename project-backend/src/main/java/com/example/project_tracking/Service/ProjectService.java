package com.example.project_tracking.Service;

import com.example.project_tracking.DTO.ProjectRequest;
import com.example.project_tracking.DTO.ProjectResponse;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.Notification;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.NotificationRepository;
import com.example.project_tracking.Repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepo;

    public ProjectService(ProjectRepository projectRepository, EmployeeRepository employeeRepository, NotificationService notificationService, NotificationRepository notificationRepo) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
        this.notificationRepo = notificationRepo;
    }

    public List<Project> getProjectsByManager(Long managerId) {

        List<Project> projects = projectRepository.findByManagerId(managerId);

        // Filter based on modellingHour being not null
        return projects.stream()
                .filter(p -> !p.getSoftDelete())
                .collect(Collectors.toList());
    }

    public List<Project> getAll(){

        List<Project> projectList = projectRepository.findAll();
        return projectList.stream()
                .filter(p -> !p.getSoftDelete())
                .collect(Collectors.toList());
    }

    public ProjectResponse convertToResponse(Project project){
        Employee e = employeeRepository.findById(project.getManagerId()).orElse(null);
        Employee tl = null;
        if(project.getTlId()!=null){
            tl = employeeRepository.findById(project.getTlId()).orElse(null);
        }
        //System.out.println(project+" "+e.toString());
        ProjectResponse response = null ;
        if(tl==null){
            response = new ProjectResponse(
                    project.getId(),
                    project.getProjectName(),
                    project.getClientName(),
                    project.getManagerId(),
                    e.getName(),
                    project.getAssignedHours(),
                    project.getWorkingHours(),
                    project.getAssignedDate(),
                    project.getProjectStatus(),
                    project.getSoftDelete(),
                    project.getModellingHours(),
                    project.getCheckingHours(),
                    project.getDetailingHours(),
                    project.getModellingTime(),
                    project.getCheckingTime(),
                    project.getDetailingTime(),
                    project.getStartDate(),
                    project.getCompletedDate(),
                    project.getStudyHours(),
                    project.getStudyHoursTracking(),
                    project.getExtraHours(),
                    project.getExtraHoursTracking(),
                    project.getProjectActivityStatus()
            );
        }
      else{
          response = new ProjectResponse(
                    project.getId(),
                    project.getProjectName(),
                    project.getClientName(),
                    project.getManagerId(),
                    e.getName(),
                    tl.getEmpId(),
                    tl.getName(),
                    project.getAssignedHours(),
                    project.getWorkingHours(),
                    project.getAssignedDate(),
                    project.getProjectStatus(),
                    project.getSoftDelete(),
                    project.getModellingHours(),
                    project.getCheckingHours(),
                    project.getDetailingHours(),
                    project.getModellingTime(),
                    project.getCheckingTime(),
                    project.getDetailingTime(),
                    project.getStartDate(),
                    project.getCompletedDate(),
                    project.getStudyHours(),
                    project.getStudyHoursTracking(),
                    project.getExtraHours(),
                    project.getExtraHoursTracking(),
                    project.getProjectActivityStatus()
            );
        }
        return response;
    }

    public void createProject(String projectName,String clientName,Long pmId,Long agmId,BigDecimal totalHours,LocalDate awardedDate,LocalDate startDate,LocalDate completedDate) {
        Project project=new Project();

        project.setProjectName(projectName);
        project.setClientName(clientName);
        project.setManagerId(pmId);
        project.setAssignedHours(totalHours);
        project.setAssignedDate(awardedDate);
        project.setStartDate(startDate);
        project.setCompletedDate(completedDate);

        if(project.getModellingHours()==null){
            project.setModellingHours(BigDecimal.ZERO);
        }

        if(project.getCheckingHours()==null){
            project.setCheckingHours(BigDecimal.ZERO);
        }

        if(project.getDetailingHours()==null){
            project.setDetailingHours(BigDecimal.ZERO);
        }
        project.setModellingTime(BigDecimal.ZERO);
        project.setCheckingTime(BigDecimal.ZERO);
        project.setDetailingTime(BigDecimal.ZERO);
        project.setWorkingHours(BigDecimal.ZERO);
        projectRepository.save(project);
        notificationService.createNotification(
                agmId,   // sender: AGM
                pmId,    // receiver: PM
                "New Project Assigned",
                "AGM has assigned you a new project: " + projectName,
                "PROJECT_ASSIGNMENT"
        );
    }
    public List<Project> getActiveProjectsByManager(Long managerId) {
        int arr[] = new int[5];
        List<Integer> list = new ArrayList<>();
        HashSet<Integer> set = new HashSet<>(list);
        System.out.println();
        return projectRepository.findByManagerIdAndProjectStatusTrue(managerId).stream()
                .filter(p -> !p.getSoftDelete())
                .collect(Collectors.toList());
    }

    public Project updateProjectHours(Long tlId,Long projectId, BigDecimal addModellingHours, BigDecimal addCheckingHours, BigDecimal addDetailingHours, BigDecimal addStudyHours,String projectActivity) {
        Optional<Project> optionalProject = projectRepository.findById(projectId);

        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
                project.setModellingHours(
                        project.getModellingHours() == null ? addModellingHours :
                                project.getModellingHours().add(addModellingHours)
                );

                project.setCheckingHours(
                        project.getCheckingHours() == null ? addCheckingHours :
                                project.getCheckingHours().add(addCheckingHours)
                );

                project.setDetailingHours(
                        project.getDetailingHours() == null ? addDetailingHours :
                                project.getDetailingHours().add(addDetailingHours)
                );

            project.setStudyHours(
                    project.getStudyHours() == null ? addStudyHours :
                            project.getStudyHours().add(addStudyHours)
            );

                project.setTlId(tlId);

                project.setProjectActivityStatus(projectActivity);

                // Save back to repo
                return projectRepository.save(project);
        } else {
            throw new RuntimeException("Project not found with ID: " + projectId);
        }
    }


    public List<Project> getProjectsByManagerNotAssigned(Long managerId) {

        List<Project> projects = projectRepository.findByManagerId(managerId);

        // Filter based on modellingHour being not null
        return projects.stream()
                .filter(p -> p.getModellingHours() == null && !p.getSoftDelete())
                .collect(Collectors.toList());
    }

    public Project editProject(ProjectRequest projectRequest)
    {
        Project old = projectRepository.findById(projectRequest.getId()).orElse(null);
        old.setAssignedHours(projectRequest.getAssignedHours());
        old.setModellingHours(projectRequest.getModellingHours());
        old.setCheckingHours(projectRequest.getCheckingHours());
        old.setDetailingHours(projectRequest.getDetailingHours());
        old.setStudyHours(projectRequest.getStudyHours());
        old.setManagerId(projectRequest.getManagerId());
        old.setProjectName(projectRequest.getProjectName());
        old.setClientName(projectRequest.getClientName());
        old.setProjectStatus(projectRequest.isProjectStatus());
        projectRepository.save(old);
        return old;
    }

    public ProjectResponse toggleStatus(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(()-> new RuntimeException("No project found with id "+id));
        project.setProjectStatus(false);
        project.setCompletedDate(LocalDate.now());
        return convertToResponse(projectRepository.save(project));
    }

    public ProjectResponse setExtra(Long id,BigDecimal extraHours) {
        Project project = projectRepository.findById(id).orElseThrow(()-> new RuntimeException("No project found with id "+id));
        project.setExtraHours(extraHours);
        //System.out.print(project.toString());
        return convertToResponse(projectRepository.save(project));
    }

    public ProjectResponse extendCompletedDate(Long id,LocalDate completedDate) {
        Project project = projectRepository.findById(id).orElseThrow(()-> new RuntimeException("No project found with id "+id));
        project.setCompletedDate(completedDate);
        //System.out.print(project.toString());
        return convertToResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getProjectsByTl(Long tlId)
    {
        return projectRepository.findByTlId(tlId).stream().filter(p -> !p.getSoftDelete()).map(this::convertToResponse).toList();
    }

    public ProjectResponse setActivity(Long id,String activity) {
        Project project = projectRepository.findById(id).orElseThrow(()-> new RuntimeException("No project Found"));
        project.setProjectActivityStatus(activity);
        return convertToResponse(projectRepository.save(project));
    }

    public Project softDelete(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(()-> new RuntimeException("No project Found"));
        project.setSoftDelete(true);
        return projectRepository.save(project);
    }
}

