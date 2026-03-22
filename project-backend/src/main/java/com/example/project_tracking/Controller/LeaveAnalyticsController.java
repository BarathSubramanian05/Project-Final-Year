package com.example.project_tracking.Controller;

import com.example.project_tracking.Repository.LeaveAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/leave-analytics")
@CrossOrigin(origins = "*")
public class LeaveAnalyticsController {

    @Autowired
    private LeaveAnalyticsRepository repo;

    @GetMapping("/types")
    public List<Object[]> getLeaveTypes() {
        return repo.countByLeaveType();
    }

    @GetMapping("/status")
    public List<Object[]> getStatus() {
        return repo.countByStatus();
    }

    @GetMapping("/monthly")
    public List<Object[]> getMonthly() {
        return repo.monthlyLeaves();
    }

    @GetMapping("/employee")
    public List<Object[]> getEmployee() {
        return repo.employeeLeaves();
    }
}