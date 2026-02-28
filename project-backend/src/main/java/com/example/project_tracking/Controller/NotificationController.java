package com.example.project_tracking.Controller;

import com.example.project_tracking.Model.Notification;
import com.example.project_tracking.Service.NotificationService;
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
    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    // Mark notification as read
    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/approve/{id}")
    public Notification markAsApproved(@PathVariable Long id)
    {
        return notificationService.markAsApproved(id);
    }

    // Create notification manually (optional, mostly used internally)
    @PostMapping("/create")
    public Notification createNotification(@RequestParam Long senderId,
                                           @RequestParam Long receiverId,
                                           @RequestParam String title,
                                           @RequestParam String message,
                                           @RequestParam String type) {
        return notificationService.createNotification(senderId, receiverId, title, message, type);
    }


}

