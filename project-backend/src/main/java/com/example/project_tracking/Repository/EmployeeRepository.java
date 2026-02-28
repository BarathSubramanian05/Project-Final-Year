package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee,Long> {
    Optional<Employee> findByUsername(String username);


    // Fetch by username and password (for login verification)
    Optional<Employee> findByUsernameAndPassword(String username, String password);

    // You can also fetch manager or TL specific employees
    List<Employee> findByReportingTo(Employee e);
    List<Employee> findByIsTLTrueAndReportingTo_EmpId(Long managerEmpId);
    List<Employee> findByIsManagerTrue();
    List<Employee> findByReportingToAndEmpIdNotIn(Employee reportingTo, List<Long> empIds);
}
