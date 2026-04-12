package com.example.project_tracking.Controller;

import com.example.project_tracking.DTO.ProjectRequest;
import com.example.project_tracking.DTO.ProjectResponse;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/project")
@CrossOrigin(origins="*")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectsByManagerId(@PathVariable long id)
    {
        System.out.println(id);
        return ResponseEntity.ok(projectService.getProjectsByManager(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/")
    public ResponseEntity<?> getAllProjects()
    {

        return ResponseEntity.ok(projectService.getAll());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/save")
    public ResponseEntity<?> createProject(@RequestParam String projectName,@RequestParam String clientName,@RequestParam Long pmId,@RequestParam Long agmId,@RequestParam BigDecimal totalHours,@RequestParam LocalDate awardedDate,@RequestParam LocalDate startDate,@RequestParam LocalDate completedDate)
    {
        projectService.createProject(projectName,clientName,pmId,agmId,totalHours,awardedDate,startDate,completedDate);
        return ResponseEntity.ok("Saved Successfully");
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/manager/{managerId}/active")
    public ResponseEntity<List<Project>> getActiveProjectsByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(projectService.getActiveProjectsByManager(managerId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/manager/{managerId}/not-assigned")
    public ResponseEntity<List<Project>> getActiveProjectsByManagerNotAssigned(@PathVariable Long managerId) {
        return ResponseEntity.ok(projectService.getProjectsByManagerNotAssigned(managerId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{projectId}/add-hours")
    public Project addProjectHours(
            @PathVariable Long projectId,
            @RequestParam Long tlId,
            @RequestParam BigDecimal modellingHours,
            @RequestParam BigDecimal checkingHours,
            @RequestParam BigDecimal detailingHours,
            @RequestParam BigDecimal studyHours,
            @RequestParam String projectActivity
            ) {
        return projectService.updateProjectHours(tlId,projectId, modellingHours, checkingHours, detailingHours,studyHours,projectActivity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/editproject")
    public ResponseEntity<?> editProject(@RequestBody ProjectRequest project)
    {
        return ResponseEntity.ok(projectService.editProject(project));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/toggle-status/{id}")
    public ResponseEntity<ProjectResponse> changeStatus(@PathVariable Long id){
        return ResponseEntity.ok(projectService.toggleStatus(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/set-extra-hours/{id}")
    public ResponseEntity<ProjectResponse> setExtraHours(@PathVariable Long id,@RequestParam BigDecimal extraHours){
        //System.out.println(id+"\n"+extraHours);
        return ResponseEntity.ok(projectService.setExtra(id,extraHours));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/extend/{id}")
    public ResponseEntity<ProjectResponse> extendCompletedDate(@PathVariable Long id,@RequestParam LocalDate completedDate){
        //System.out.println(id+"\n"+extraHours);
        return ResponseEntity.ok(projectService.extendCompletedDate(id,completedDate));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/get-by-tl/{id}")
    public ResponseEntity<?> getProjectsByTlId(@PathVariable Long id)
    {
        return ResponseEntity.ok(projectService.getProjectsByTl(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/update-activity/{id}")
    public ResponseEntity<?> setActivityStatus(@PathVariable Long id,@RequestParam String activity)
    {
        return ResponseEntity.ok(projectService.setActivity(id,activity));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("soft-delete/{id}")
    public ResponseEntity<?> softDelete(@PathVariable Long id)
    {
        return ResponseEntity.ok(projectService.softDelete(id));
    }

//    @PreAuthorize("permitAll()")
//    @GetMapping("/whoami")
//    public Object whoami(Authentication authentication) {
//        return authentication;
//    }

}
