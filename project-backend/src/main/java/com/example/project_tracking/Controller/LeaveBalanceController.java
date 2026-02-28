package com.example.project_tracking.Controller;

import com.example.project_tracking.Service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/leave/balance")
@CrossOrigin(origins = "*")
public class LeaveBalanceController {

    @Autowired
    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping("/employee/{empid}")
    public ResponseEntity<?> getByEmployee(@PathVariable Long empid)
    {
        System.out.println(empid);
        return ResponseEntity.ok(leaveBalanceService.getLeaveObject(empid, LocalDate.now().getYear()));
    }
}
