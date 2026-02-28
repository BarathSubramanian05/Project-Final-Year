package com.example.project_tracking.Controller;

import com.example.project_tracking.DTO.AssignedWorkRequest;
import com.example.project_tracking.DTO.AssignedWorkResponse;
import com.example.project_tracking.Model.AssignedWork;
import com.example.project_tracking.Service.AssignedWorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assigned-work")
@CrossOrigin(origins = "*")
public class AssignedWorkController {

    @Autowired
    private AssignedWorkService assignedWorkService;

    // ✅ Create new assigned work
    @PostMapping
    public ResponseEntity<?> createAssignedWork(@RequestBody AssignedWorkRequest assignedWork) {
        return ResponseEntity.ok(assignedWorkService.createAssignedWork(assignedWork));
    }

    // ✅ Get all assigned works
    @GetMapping
    public ResponseEntity<?> getAllAssignedWorks() {
        return ResponseEntity.ok(assignedWorkService.getAllAssignedWorks());
    }

    // ✅ Get assigned works by employee ID
    @GetMapping("/employee/{empId}")
    public ResponseEntity<?> getAssignedWorksByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(assignedWorkService.getAssignedWorksByEmployee(empId));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getAssignedWorksByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(assignedWorkService.getAssignedWorksByManager(managerId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getAssignedWorksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(assignedWorkService.getAssignedWorksByProject(projectId));
    }

    // ✅ Update status (PENDING → IN_PROGRESS → COMPLETED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(assignedWorkService.updateAssignedWorkStatus(id, status));
    }

    @GetMapping("/project/{projectId}/employee/{employeeId}/active")
    public ResponseEntity<?> getActivityByEmployeeAndProject(@PathVariable Long projectId,@PathVariable Long employeeId)
    {
        return  ResponseEntity.ok(assignedWorkService.getActivityByEmployeeProjectStatus(projectId,employeeId,"pending"));
    }

    // ✅ Delete assignment (if needed)
    @DeleteMapping("/{id}")
    public void deleteAssignedWork(@PathVariable Long id) {
        assignedWorkService.deleteAssignedWork(id);
    }
}

