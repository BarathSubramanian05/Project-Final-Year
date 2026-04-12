package com.example.project_tracking.Controller;

import com.example.project_tracking.Model.Notification;
import com.example.project_tracking.Service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get all notifications for a user
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    // Mark notification as read
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/approve/{id}")
    public Notification markAsApproved(@PathVariable Long id)
    {
        return notificationService.markAsApproved(id);
    }

    // Create notification manually (optional, mostly used internally)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/create")
    public Notification createNotification(@RequestParam Long senderId,
                                           @RequestParam Long receiverId,
                                           @RequestParam String title,
                                           @RequestParam String message,
                                           @RequestParam String type) {
        return notificationService.createNotification(senderId, receiverId, title, message, type);
    }


}

