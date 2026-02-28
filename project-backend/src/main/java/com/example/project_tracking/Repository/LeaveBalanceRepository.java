package com.example.project_tracking.Repository;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByEmployeeAndYear(Employee employee, int year);
}

