package com.example.project_tracking.Controller;

import com.example.project_tracking.Model.Activity;
import com.example.project_tracking.Service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activity")
@CrossOrigin(origins="*")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/")
    public ResponseEntity<?> getActive()
    {
        List<Activity> all = activityService.findActiveActivities();
        return ResponseEntity.ok(all);
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAll()
    {
        List<Activity> response = activityService.findAllActivity();
        return response!=null ? ResponseEntity.ok(response) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveActivity(@RequestBody Activity activity){
        activityService.saveNewActivity(activity);
        System.out.println(activity.toString());
        return ResponseEntity.ok("Activity saved");
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editActivity(@PathVariable Long id,@RequestBody Activity activity){
        activityService.editActivity(activity,id);
        return ResponseEntity.ok("Activity saved");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable Long id)
    {
        activityService.deleteActivity(id);
        return ResponseEntity.ok("Deleted Successfully");
    }

    @GetMapping("/get-type/{id}")
    public String getMainType(@PathVariable Long id)
    {
        String mainType=activityService.getMainType(id);
        return mainType;
    }
}
