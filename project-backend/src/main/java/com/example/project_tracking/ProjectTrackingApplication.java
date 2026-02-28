package com.example.project_tracking;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProjectTrackingApplication {
	public static void main(String[] args) {
		SpringApplication.run(ProjectTrackingApplication.class, args);
	}
}