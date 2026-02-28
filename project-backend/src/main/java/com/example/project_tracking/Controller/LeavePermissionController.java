package com.example.project_tracking.Controller;
import com.example.project_tracking.DTO.LeavePermissionResponse;
import com.example.project_tracking.Model.LeavePermission;
import com.example.project_tracking.Service.LeavePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/leave")
@CrossOrigin(origins = "*")
public class LeavePermissionController {

    private final LeavePermissionService leavePermissionService;

    public LeavePermissionController(LeavePermissionService leavePermissionService) {
        this.leavePermissionService = leavePermissionService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody LeavePermission leavePermission) {
        leavePermissionService.saveLeavePermission(leavePermission);
        System.out.println(leavePermission.toString());
        return ResponseEntity.ok("Successfully saved");
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<?> getByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByEmployeeId(empId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(leavePermissionService.getAllRequests());
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getByManagerPending(@PathVariable Long managerId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByManagerId(managerId));
    }

    @GetMapping("/manager-approved/{managerId}")
    public ResponseEntity<?> getByManagerApproved(@PathVariable Long managerId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByManagerIdApproved(managerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeavePermissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leavePermissionService.getRequestById(id)
                .orElseThrow(() -> new RuntimeException("Leave/Permission not found")));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<LeavePermissionResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(leavePermissionService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public void deleteRequest(@PathVariable Long id) {
        leavePermissionService.deleteRequest(id);
    }
}

