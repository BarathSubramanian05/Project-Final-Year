package com.example.project_tracking.Controller;
import com.example.project_tracking.DTO.WorkDetailsRequest;
import com.example.project_tracking.DTO.WorkDetailsResponse;
import com.example.project_tracking.Service.WorkDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/workdetails")
@CrossOrigin(origins = "*")
public class WorkDetailsController {

    private final WorkDetailsService workDetailsService;

    public WorkDetailsController(WorkDetailsService workDetailsService) {
        this.workDetailsService = workDetailsService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllLogsByprojectStatus()
    {
        return ResponseEntity.ok(workDetailsService.getAllLogsByProjectStatus());
    }

    @GetMapping("/")
    public ResponseEntity<?> getAllLogs()
    {
        return ResponseEntity.ok(workDetailsService.getAll());
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveWorkDetails(@RequestBody WorkDetailsRequest workDetails) {
        System.out.println(workDetails.toString());
        WorkDetailsResponse saved = workDetailsService.saveWorkDetails(workDetails);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetails(@PathVariable Long id)
    {
        return ResponseEntity.ok(workDetailsService.getByDetailsId(id));
    }
    @GetMapping("/active/{employeeId}")
    public ResponseEntity<WorkDetailsResponse> getActiveWork(@PathVariable Long employeeId) {
        WorkDetailsResponse activeWork = workDetailsService.getActiveWorkByEmployee(employeeId);
        return ResponseEntity.ok(activeWork);
    }

    @GetMapping("/assigned-work/{id}")
    public ResponseEntity<?> getAssigned(@PathVariable Long id)
    {
        return ResponseEntity.ok(workDetailsService.getAssignedWork(id));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByEmployee(id));
    }

    @GetMapping("/manager/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByManager(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByManager(id));
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByProject(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByProject(id));
    }

    @GetMapping("/activity/{id}")
    public ResponseEntity<List<WorkDetailsResponse>> getByActivity(@PathVariable Long id) {
        return ResponseEntity.ok(workDetailsService.getByActivity(id));
    }

    @GetMapping("/employee/{empId}/project/{projId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByEmployeeAndProject(@PathVariable Long empId, @PathVariable Long projId) {
        return ResponseEntity.ok(workDetailsService.getByEmployeeAndProject(empId, projId));
    }

    @GetMapping("/manager/{mgrId}/project/{projId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByManagerAndProject(@PathVariable Long mgrId, @PathVariable Long projId) {
        return ResponseEntity.ok(workDetailsService.getByManagerAndProject(mgrId, projId));
    }

    @GetMapping("/project/{projId}/activity/{actId}")
    public ResponseEntity<List<WorkDetailsResponse>> getByProjectAndActivity(@PathVariable Long projId, @PathVariable Long actId) {
        return ResponseEntity.ok(workDetailsService.getByProjectAndActivity(projId, actId));
    }
    @PutMapping("/stop/{employeeId}")
    public ResponseEntity<WorkDetailsResponse> stopWork(
            @PathVariable Long employeeId) {

        WorkDetailsResponse updated =
                workDetailsService.stopWork(employeeId);

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/savefinal")
    public ResponseEntity<WorkDetailsResponse> saveFinal(@RequestBody WorkDetailsRequest request , @RequestParam Long activeWorkId) {
        System.out.println(request.toString());
        System.out.println(activeWorkId);
        WorkDetailsResponse saved = workDetailsService.saveFinalWork(request,activeWorkId);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/edit-log/{id}")
    public ResponseEntity<?> editWorkLog(@PathVariable long id,@RequestBody WorkDetailsRequest workDetails)
    {
        return ResponseEntity.ok(workDetailsService.editWorkDetail(id,workDetails));
    }

    @DeleteMapping("/work/discard/{id}")
    public ResponseEntity<String> discardWork(@PathVariable Long id) {
        System.out.println(id);
        workDetailsService.discardWork(id);
        return ResponseEntity.ok("Work entry discarded successfully");
    }

}

