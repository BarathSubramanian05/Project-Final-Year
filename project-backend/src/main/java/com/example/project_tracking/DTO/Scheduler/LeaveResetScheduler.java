package com.example.project_tracking.DTO.Scheduler;

import com.example.project_tracking.Model.LeaveBalance;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Repository.LeaveBalanceRepository;
import com.example.project_tracking.Repository.ProjectRepository;
import com.example.project_tracking.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Component
public class LeaveResetScheduler {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepo;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(cron = "0 0 0 1 1 *") // Every Jan 1st at 00:00
    public void resetLeaves() {
        int nextYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepo.findAll();

        for (LeaveBalance lb : balances) {
            lb.setCasualLeaves(12);
            lb.setSickLeaves(8);
            lb.setYear(nextYear);
            lb.setMaternityLeaves(14);
            lb.setMarriageLeaves(14);
        }

        leaveBalanceRepo.saveAll(balances);
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void resetMonthlyLeaves() {
        List<LeaveBalance> balances = leaveBalanceRepo.findAll();

        for (LeaveBalance lb : balances) {
            lb.setPermissionBalance(4.0);
        }

        leaveBalanceRepo.saveAll(balances);

    }

    @Scheduled(cron = "0 0 9 * * *") // 1:35 PM daily
    public void sendDelayAlerts() {
        LocalDate today = LocalDate.now();
        List<Project> delayedProjects = projectRepository.findDelayedProjects(today);

        for (Project project : delayedProjects) {
            notificationService.createNotification(
                    project.getManagerId(),    // sender (manager)
                    1001L,
                    "Project Distribution Delayed",
                    "Project '" + project.getProjectName() + "' has passed its start date but it is not yet distributed.",
                    "DELAY_ALERT"
            );
            notificationService.createNotification(
                    1001L,
                    project.getManagerId(),
                    "Project Distribution Delayed",
                    "Project '" + project.getProjectName() + "' has passed its start date but it is not yet distributed.",
                    "DELAY_ALERT"
            );

            notificationService.createNotification(
                    project.getManagerId(),    // sender (manager)
                    1002L,
                    "Project Distribution Delayed",
                    "Project '" + project.getProjectName() + "' has passed its start date but it is not yet distributed.",
                    "DELAY_ALERT"
            );
            project.setRemainderSentDate(today); // mark as notified
        }

        projectRepository.saveAll(delayedProjects);
    }


    @Scheduled(cron = "0 0 9 * * *") // every day at 9 AM
    public void sendProjectDistributionReminders() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        // Fetch projects that start tomorrow but not distributed
        List<Project> pendingProjects = projectRepository.findProjectsForPreStartReminder(today, tomorrow);
        System.out.println(pendingProjects);
        for (Project project : pendingProjects) {
            try {
                // Notify AGM
                notificationService.createNotification(
                        project.getManagerId(),    // sender (manager)
                        1001L,       // receiver (AGM)
                        "Project Distribution Reminder",
                        "Reminder: Project '" + project.getProjectName() +
                                "' starts tomorrow but it is not yet distributed.",
                        "REMINDER"
                );
                notificationService.createNotification(
                        1001L,
                        project.getManagerId(),
                        "Project Distribution Reminder",
                        "Reminder: Project '" + project.getProjectName() +
                                "' starts tomorrow but it is not yet distributed.",
                        "REMINDER"
                );

                notificationService.createNotification(
                        project.getManagerId(),
                        1002L,
                        "Project Distribution Reminder",
                        "Reminder: Project '" + project.getProjectName() +
                                "' starts tomorrow but it is not yet distributed.",
                        "REMINDER"
                );


                // Mark reminder as sent
                project.setRemainderSentDate(today);
                projectRepository.save(project);

            } catch (Exception e) {
                System.err.println("Failed to send reminder for project: " + project.getProjectName());
            }
        }
    }
}