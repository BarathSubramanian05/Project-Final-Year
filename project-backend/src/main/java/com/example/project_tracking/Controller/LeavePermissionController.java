package com.example.project_tracking.Controller;

import com.example.project_tracking.DTO.LeavePermissionResponse;
import com.example.project_tracking.Model.LeavePermission;
import com.example.project_tracking.Service.LeavePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/leave")
@CrossOrigin(origins = "*")
public class LeavePermissionController {

    private final LeavePermissionService leavePermissionService;

    public LeavePermissionController(LeavePermissionService leavePermissionService) {
        this.leavePermissionService = leavePermissionService;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody LeavePermission leavePermission) {
        leavePermissionService.saveLeavePermission(leavePermission);
        System.out.println(leavePermission.toString());
        return ResponseEntity.ok("Successfully saved");
    }


    @PreAuthorize("isAuthenticated()")
    @GetMapping("/employee/{empId}")
    public ResponseEntity<?> getByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByEmployeeId(empId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(leavePermissionService.getAllRequests());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getByManagerPending(@PathVariable Long managerId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByManagerId(managerId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/manager-approved/{managerId}")
    public ResponseEntity<?> getByManagerApproved(@PathVariable Long managerId) {
        return ResponseEntity.ok(leavePermissionService.getRequestsByManagerIdApproved(managerId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<LeavePermissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leavePermissionService.getRequestById(id)
                .orElseThrow(() -> new RuntimeException("Leave/Permission not found")));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/status/{id}")
    public ResponseEntity<LeavePermissionResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(leavePermissionService.updateStatus(id, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteRequest(@PathVariable Long id) {
        leavePermissionService.deleteRequest(id);
    }
}

