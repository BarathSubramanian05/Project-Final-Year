package com.example.project_tracking.Service;

import com.example.project_tracking.DTO.DataTransfer;
import com.example.project_tracking.DTO.LoginRequest;
import com.example.project_tracking.DTO.ProjectRequest;
import com.example.project_tracking.DTO.WorkDetailsResponse;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.LeaveBalance;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Model.WorkDetails;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    private  final EmployeeRepository employeeRepository;

    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;


    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public DataTransfer userLogin(String username, String password) {
        //String hashed = PasswordUtil.hashPassword(password);
        Employee employee = employeeRepository.findByUsernameAndPassword(username, password)
                .orElse(null);

        if (employee != null) {
            // Map Employee entity to DataTransfer DTO
            return new DataTransfer(
                    employee.getEmpId(),
                    employee.getName(),
                    employee.getDesignation(),
                    employee.getIsManager(),  // isManager
                    employee.getIsTL(),       // isTL
                    employee.getReportingTo() ,
                    employee.getDesignationCategory()
            );
        } else {
            return null; // Will trigger 401 in controller
        }
    }

    public DataTransfer getEmployeeById(long id)
    {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee != null) {
            // Map Employee entity to DataTransfer DTO
            return new DataTransfer(
                    employee.getEmpId(),
                    employee.getName(),
                    employee.getDesignation(),
                    employee.getIsManager(),  // isManager
                    employee.getIsTL(),       // isTL
                    employee.getReportingTo(),
                    employee.getDesignationCategory()
            );
        } else {
            return null; // Will trigger 401 in controller
        }
    }

    public List<Employee> getTLsUnderManager(Long managerId) {
        return employeeRepository.findByIsTLTrueAndReportingTo_EmpId(managerId).stream().filter(e -> !e.getSoftDelete()).collect(Collectors.toList());
    }

    public List<Employee> getAllManagers() {
        return employeeRepository.findByIsManagerTrue().stream().filter(e -> !e.getSoftDelete()).collect(Collectors.toList());
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll().stream().filter(e -> !e.getSoftDelete()).collect(Collectors.toList());
    }

    public void addEmployee(Employee employee)
    {

        if(employee.getReportingTo()!=null)
        {
            Long id = employee.getReportingTo().getEmpId();
            Employee manager = employeeRepository.findById(id).orElse(null);
            System.out.println("Manager:"+manager.toString());
            employee.setReportingTo(manager);
        }
        employeeRepository.save(employee);
        LeaveBalance leaveBalance=new LeaveBalance(employee);
        System.out.println("Employee:"+employee.getReportingTo());
        leaveBalanceRepository.save(leaveBalance);

    }

    public List<DataTransfer> getEmployeesByManagerId(Long mgrid) {
        Employee emp = employeeRepository.findById(mgrid).orElse(null);
        if(emp==null) return null;
        return employeeRepository.findByReportingTo(emp).stream().filter(e -> !e.getSoftDelete()).map(this::convertToResponse).collect(Collectors.toList());
    }

    public Employee editEmployee(Employee employee)
    {
        Employee old = employeeRepository.findById(employee.getEmpId()).orElse(null);
        old.setName(employee.getName());
        old.setDesignation(employee.getDesignation());
        old.setDesignationCategory(employee.getDesignationCategory());
        old.setIsTL(employee.getIsTL());
        old.setIsManager(employee.getIsManager());
        old.setReportingTo(employee.getReportingTo());
        old.setUsername(employee.getUsername());
        old.setPassword(employee.getPassword());
        employeeRepository.save(old);
        return old;
    }

    public DataTransfer convertToResponse(Employee employee) {
        return new DataTransfer(
                employee.getEmpId(),
                employee.getName(),
                employee.getDesignation(),
                employee.getIsManager(),  // isManager
                employee.getIsTL(),       // isTL
                employee.getReportingTo(), // reporting manager, DTO constructor handles null
                employee.getDesignationCategory()
        );
    }


    public Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id).orElseThrow(()-> new RuntimeException("No employee found by id "+id));
    }

    public String softDelete(Long id) {
        Employee emp = employeeRepository.findById(id).orElse(null);
        if (emp == null) {
            throw new RuntimeException("Employee not found");
        }
        emp.setSoftDelete(true); // or emp.setStatus("INACTIVE");
        employeeRepository.save(emp);
        return "Employee soft deleted successfully!";
    }

}
