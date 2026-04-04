package com.example.project_tracking.DataLoader;

import com.example.project_tracking.DataLoader.Reset.EmployeeResetter;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.LeaveBalance;
import com.example.project_tracking.Model.Role;
import com.example.project_tracking.Model.UserRole;
import com.example.project_tracking.Repository.EmployeeRepository;
import com.example.project_tracking.Repository.LeaveBalanceRepository;
import com.example.project_tracking.Repository.RoleRepository;
import com.example.project_tracking.Repository.UserRoleRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(2)
public class CSVLoader implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private EmployeeResetter resetter;
    @Autowired
    private EmployeeResetter leaveResetter;

    @Autowired
    private final LeaveBalanceRepository leaveBalanceRepository;

    public CSVLoader(EmployeeRepository employeeRepository, EmployeeResetter leaveResetter, LeaveBalanceRepository leaveBalanceRepository, RoleRepository roleRepository,UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() > 0) {
            return; // prevent duplicate inserts
        }
//        resetter.resetEmployeeTable();
//        leaveResetter.resetLeaveTable();
        Map<Long, Employee> tempMap = new HashMap<>();
        List<String[]> rows;

        try (Reader reader = new InputStreamReader(
                getClass().getResourceAsStream("/data/employees.csv"))) {

            CSVReader csvReader = new CSVReader(reader);
            rows = csvReader.readAll();
        }

        // Step 1: Insert employees WITHOUT reportingTo
        for (int i = 1; i < rows.size(); i++) { // skip header
            String[] row = rows.get(i);
            //System.out.println(Arrays.toString(row));
            Employee emp = new Employee();
            emp.setEmpId(Long.parseLong(row[0]));
            emp.setName(row[1]);
            emp.setDesignation(row[2]);
            emp.setIsManager("1".equals(row[3]));
            emp.setIsTL("1".equals(row[4]));
            emp.setUsername(row[6]);
            emp.setPassword(passwordEncoder.encode(row[7]));
            emp.setDesignationCategory(row[8]);

            Employee saved = employeeRepository.save(emp);
            UserRole ur = new UserRole();
            Role role;
            if(emp.getDesignationCategory().equalsIgnoreCase("Assistant General Manager")){
                role = roleRepository.findById(1L).orElse(null);
                ur.setRole(role);
                ur.setUser(emp);
                userRoleRepository.save(ur);
            }
            tempMap.put(Long.parseLong(row[0]), saved);
        }

        // Step 2: Update reportingTo relationships
        for (int i = 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            String reportingToStr = row[5];

            if (reportingToStr != null && !reportingToStr.isBlank()) {
                Long currentId = Long.parseLong(row[0]);
                Long reportingToId = Long.parseLong(reportingToStr);

                Employee emp = tempMap.get(currentId);
                Employee manager = tempMap.get(reportingToId);

                emp.setReportingTo(manager);
                UserRole ur = new UserRole();
                Role role;
                if(emp.getDesignationCategory().equalsIgnoreCase("Assistant General Manager") || emp.getDesignationCategory().equalsIgnoreCase("Admin")){
                    role = roleRepository.findById(1L).orElse(null);
                }
                else if(emp.getDesignationCategory().equalsIgnoreCase("Project Manager"))
                {
                    role = roleRepository.findById(2L).orElse(null);
                }
                else{
                    role = roleRepository.findById(3L).orElse(null);
                }
                ur.setRole(role);
                ur.setUser(emp);
                userRoleRepository.save(ur);
                LeaveBalance leaveBalance = new LeaveBalance(emp);
                leaveBalanceRepository.save(leaveBalance);
                employeeRepository.save(emp);
            }
        }
        System.out.println("✅ Employee CSV loaded successfully!");
    }
}
