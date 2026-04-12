package com.example.project_tracking.Controller;

import com.example.project_tracking.DTO.*;
import com.example.project_tracking.Repository.AssignedWorkRepository;
import com.example.project_tracking.Repository.WorkDetailsRepository;
import com.example.project_tracking.Service.WorkDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/workdetails")
@CrossOrigin(origins = "*")
public class WorkDetailsController {

    private final WorkDetailsService workDetailsService;
    private final WorkDetailsRepository workDetailsRepository;
    private final AssignedWorkRepository assignedWorkRepository;

    public WorkDetailsController(WorkDetailsService workDetailsService, WorkDetailsRepository workDetailsRepository, AssignedWorkRepository assignedWorkRepository) {
        this.workDetailsService = workDetailsService;
        this.workDetailsRepository = workDetailsRepository;
        this.assignedWorkRepository = assignedWorkRepository;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllLogsByprojectStatus()
    {
        return ResponseEntity.ok(workDetailsService.getAllLogsByProjectStatus());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/")
    public ResponseEntity<?> getAllLogs()
    {
        return ResponseEntity.ok(workDetailsService.getAll());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/save")
    public ResponseEntity<?> saveWorkDetails(@RequestBody WorkDetailsRequest workDetails) {
        System.out.println(workDetails.toString());
        WorkDetailsResponse saved = workDetailsService.saveWorkDetails(workDetails);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetails(@PathVariable Long id)
    {
        return ResponseEntity.ok(workDetailsService.getByDetailsId(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/active/{employeeId}")
    public ResponseEntity<WorkDetailsResponse> getActiveWork(@PathVariable Long employeeId) {
        WorkDetailsResponse activeWork = workDetailsService.getActiveWorkByEmployee(employeeId);
        return ResponseEntity.ok(activeWork);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/assigned-work/{id}")
    public ResponseEntity<?> getAssigned(@PathVariable Long id)
    {
        return ResponseEntity.ok(workDetailsService.getAssignedWork(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/employee/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByEmployee(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/manager/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByManager(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByManager(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/project/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByProject(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByProject(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/activity/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByActivity(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByActivity(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/employee/{empId}/project/{projId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByEmployeeAndProject(@PathVariable Long empId, @PathVariable Long projId) {
        return ResponseEntity.ok(workDetailsService.getByEmployeeAndProject(empId, projId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/manager/{mgrId}/project/{projId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByManagerAndProject(@PathVariable Long mgrId, @PathVariable Long projId) {
        return ResponseEntity.ok(workDetailsService.getByManagerAndProject(mgrId, projId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/project/{projId}/activity/{actId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByProjectAndActivity(@PathVariable Long projId, @PathVariable Long actId) {
        return ResponseEntity.ok(workDetailsService.getByProjectAndActivity(projId, actId));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/stop/{employeeId}")
    public ResponseEntity<WorkDetailsResponse> stopWork(
            @PathVariable Long employeeId) {

        WorkDetailsResponse updated =
                workDetailsService.stopWork(employeeId);

        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/savefinal")
    public ResponseEntity<WorkDetailsResponse> saveFinal(@RequestBody WorkDetailsRequest request , @RequestParam Long activeWorkId) {
        System.out.println(request.toString());
        System.out.println(activeWorkId);
        WorkDetailsResponse saved = workDetailsService.saveFinalWork(request,activeWorkId);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/edit-log/{id}")
    public ResponseEntity<?> editWorkLog(@PathVariable long id,@RequestBody WorkDetailsRequest workDetails)
    {
        return ResponseEntity.ok(workDetailsService.editWorkDetail(id,workDetails));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/work/discard/{id}")
    public ResponseEntity<String> discardWork(@PathVariable Long id) {
        System.out.println(id);
        workDetailsService.discardWork(id);
        return ResponseEntity.ok("Work entry discarded successfully");
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/analytics/work-hours")
    public List<EmployeeWorkHoursDTO> getWorkHours() {
        return workDetailsRepository.getEmployeeWorkHours();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/analytics/daily-productivity")
    public List<DailyProductivityDTO> getDailyProductivity() {
        return workDetailsRepository.getDailyProductivity();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/analytics/task-status")
    public List<TaskStatusDTO> getTaskStatus() {
        return assignedWorkRepository.getTaskStatus();
    }

    @PostMapping("/admin/rebuild-hours")
    public String rebuild() {

        workDetailsService.rebuildAllProjectHoursFromWorkDetails();

        return "Rebuild completed";
    }
}

