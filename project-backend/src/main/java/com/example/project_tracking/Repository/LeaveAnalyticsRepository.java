package com.example.project_tracking.Repository;

import com.example.project_tracking.Model.LeavePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveAnalyticsRepository extends JpaRepository<LeavePermission, Long> {

    // Leave type count
    @Query("SELECT l.leaveType, COUNT(l) FROM LeavePermission l GROUP BY l.leaveType")
    List<Object[]> countByLeaveType();

    // Status count
    @Query("SELECT l.status, COUNT(l) FROM LeavePermission l GROUP BY l.status")
    List<Object[]> countByStatus();

    // Monthly leaves
    @Query("""
      SELECT MONTH(l.fromDate), SUM(l.leaveDays)
      FROM LeavePermission l
      GROUP BY MONTH(l.fromDate)
    """)
    List<Object[]> monthlyLeaves();

    // Employee-wise
    @Query("""
      SELECT l.employee.name, SUM(l.leaveDays)
      FROM LeavePermission l
      GROUP BY l.employee.name
    """)
    List<Object[]> employeeLeaves();
}
