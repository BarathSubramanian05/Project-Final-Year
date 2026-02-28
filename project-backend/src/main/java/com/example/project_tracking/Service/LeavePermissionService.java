package com.example.project_tracking.Service;

import com.example.project_tracking.DTO.LeavePermissionResponse;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.LeaveBalance;
import com.example.project_tracking.Model.LeavePermission;
import com.example.project_tracking.Repository.LeaveBalanceRepository;
import com.example.project_tracking.Repository.LeavePermissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeavePermissionService {

    private final LeavePermissionRepository leavePermissionRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeavePermissionService(LeavePermissionRepository leavePermissionRepository, LeaveBalanceRepository leaveBalanceRepository) {
        this.leavePermissionRepository = leavePermissionRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    // Save leave/permission request (still uses entity)
    public void saveLeavePermission(LeavePermission leavePermission) {
               leavePermissionRepository.save(leavePermission);
    }

    // Get all requests as DTOs
    public List<LeavePermissionResponse> getAllRequests() {
        return leavePermissionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Get request by ID as DTO
    public Optional<LeavePermissionResponse> getRequestById(Long id) {
        return leavePermissionRepository.findById(id)
                .map(this::mapToDTO);
    }

    // Get requests by Employee ID as DTOs
    public List<LeavePermissionResponse> getRequestsByEmployeeId(Long empId) {
        return leavePermissionRepository.findByEmployee_EmpId(empId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Get requests by Manager ID as DTOs.It shows Pending requests only
    public List<LeavePermissionResponse> getRequestsByManagerId(Long managerId) {
        return leavePermissionRepository.findByManager_EmpId(managerId)
                .stream()
                .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()) && Boolean.TRUE.equals(r.isActive()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeavePermissionResponse> getRequestsByManagerIdApproved(Long managerId) {
        return leavePermissionRepository.findByManager_EmpId(managerId)
                .stream()
                .filter(r -> "Approved".equalsIgnoreCase(r.getStatus()) && Boolean.TRUE.equals(r.isActive()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Soft delete request
    public void deleteRequest(Long id) {
        LeavePermission leave = leavePermissionRepository.findById(id).orElse(null);
        if (leave != null) {
            leave.setActive(false);
            leave.setStatus("Rejected");
            leavePermissionRepository.save(leave); // persist soft delete
        }
    }

    // Update status and return DTO
    @Transactional
    public LeavePermissionResponse updateStatus(Long id, String status) {
        LeavePermission req = leavePermissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave/Permission not found"));
        req.setStatus(status);
        Employee emp = req.getEmployee();
        Optional<LeaveBalance> leaveBalance = leaveBalanceRepository.findByEmployeeAndYear(emp, LocalDate.now().getYear());
        if (leaveBalance.isPresent()){
            LeaveBalance leaveBalance1 = leaveBalance.get();
            if(req.getType().trim().equalsIgnoreCase("Permission")){
                if(req.getPermissionHours()>leaveBalance1.getPermissionBalance()){
                    throw new RuntimeException("Insufficient Permission Hours Balance");
                }
                leaveBalance1.setPermissionBalance(leaveBalance1.getPermissionBalance()-req.getPermissionHours());
            }
            else{
                if(req.getLeaveType().trim().equalsIgnoreCase("sl")){
                    if(leaveBalance1.getSickLeaves()< req.getLeaveDays()){
                        throw new RuntimeException("Insufficient Sick Leave Balance");
                    }
                    leaveBalance1.setSickLeaves(leaveBalance1.getSickLeaves()-req.getLeaveDays());
                }
                if(req.getLeaveType().trim().equalsIgnoreCase("cl")){
                    if(leaveBalance1.getCasualLeaves()< req.getLeaveDays()){
                        throw new RuntimeException("Insufficient Casual Leave Balance");
                    }
                    leaveBalance1.setCasualLeaves(leaveBalance1.getCasualLeaves()-req.getLeaveDays());
                }
                if(req.getLeaveType().trim().equalsIgnoreCase("Marriage Leave")){
                    if(leaveBalance1.getMarriageLeaves()< req.getLeaveDays()){
                        throw new RuntimeException("Insufficient Marriage Leave Balance");
                    }
                    leaveBalance1.setMarriageLeaves(leaveBalance1.getMarriageLeaves()-req.getLeaveDays());
                }
                if(req.getLeaveType().trim().equalsIgnoreCase("Maternity Leave")){
                    if(leaveBalance1.getMaternityLeaves()< req.getLeaveDays()){
                        throw new RuntimeException("Insufficient Maternity Leave Balance");
                    }
                    leaveBalance1.setMaternityLeaves(leaveBalance1.getMaternityLeaves()-req.getLeaveDays());
                }
            }
            leaveBalanceRepository.save(leaveBalance1);
        }
        LeavePermission updated = leavePermissionRepository.save(req);
        return mapToDTO(updated);
    }

    // -----------------------
    // Helper method to convert entity → DTO
    private LeavePermissionResponse mapToDTO(LeavePermission lp) {
        return new LeavePermissionResponse(
                lp.getId(),
                lp.getEmployee().getName(),
                lp.getManager().getName(),
                lp.getType(),
                lp.getLeaveDuration(),
                lp.getFromDate(),
                lp.getToDate(),
                lp.getLeaveDays(),
                lp.getLeaveType(),
                lp.getReason(),
                lp.getAppliedDate(),
                lp.getPermissionInTime(),
                lp.getPermissionOutTime(),
                lp.getPermissionHours(),
                lp.getStatus(),
                lp.isActive()
        );
    }
}
