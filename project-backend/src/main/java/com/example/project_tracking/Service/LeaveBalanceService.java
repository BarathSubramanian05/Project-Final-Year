package com.example.project_tracking.Service;

import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.LeaveBalance;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.LeaveBalanceRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceService(LeaveBalanceRepository leaveBalanceRepository, EmployeeRepository employeeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public LeaveBalance getLeaveObject(Long empId,int year)
    {
        Employee employee = employeeRepository.findById(empId).orElseThrow(()-> new RuntimeException("No employee found with id"+empId));
        Optional<LeaveBalance> leave = leaveBalanceRepository.findByEmployeeAndYear(employee,year);
        return leave.orElse(null);
    }
}
