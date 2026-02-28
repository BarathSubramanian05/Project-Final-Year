package com.example.project_tracking.Service;

import com.example.project_tracking.Model.Activity;
import com.example.project_tracking.Repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public List<Activity> findAllActivity() {
        return activityRepository.findAll()
                .stream()
                .filter(activity -> !activity.getSoftDelete()) // assuming softDelete is boolean
                .toList();
    }


    public List<Activity> findActiveActivities()
    {
        return activityRepository.findBySoftDeleteFalse();
    }

    public void saveNewActivity(Activity a)
    {
        activityRepository.save(a);
    }

    public void editActivity(Activity a,Long id)
    {
        Activity activity = activityRepository.findById(id).orElse(null);
        if(activity!=null)
        {
            activity.setActivityName(a.getActivityName());
            activity.setCategory(a.getCategory());
            activity.setMainType(a.getMainType());
            activityRepository.save(activity);
        }
    }

    public void deleteActivity(Long id)
    {
        Activity activity = activityRepository.findById(id).orElse(null);
        if(activity!=null)
        {
            activity.setSoftDelete(true);
            activityRepository.save(activity);
        }

    }

    public String getMainType(Long id)
    {
        Activity activity = activityRepository.findById(id).orElse(null);
        return activity.getMainType();
    }
}
