package com.example.project_tracking.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "activity")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(nullable = false)
    private String category;

    @Column(name = "main_type")
    private String mainType;

    @Column(name = "soft_delete")
    private Boolean softDelete = false;

    // Constructors
    public Activity() {}

    public Activity(String activityName, String category, String mainType, Boolean softDelete) {
        this.activityName = activityName;
        this.category = category;
        this.mainType = mainType;
        this.softDelete = softDelete;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMainType() {
        return mainType;
    }

    public void setMainType(String mainType) {
        this.mainType = mainType;
    }

    public Boolean getSoftDelete() {
        return softDelete;
    }

    public void setSoftDelete(Boolean softDelete) {
        this.softDelete = softDelete;
    }

    @Override
    public String toString() {
        return "Activity{" +
                "id=" + id +
                ", activityName='" + activityName + '\'' +
                ", category='" + category + '\'' +
                ", mainType='" + mainType + '\'' +
                ", softDelete=" + softDelete +
                '}';
    }
}

