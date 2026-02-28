package com.example.project_tracking.DataLoader;
import com.example.project_tracking.DataLoader.Reset.EmployeeResetter;
import com.example.project_tracking.Model.Activity;
import com.example.project_tracking.Repository.ActivityRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;

@Component
@Order(2)
public class ActivityCSVLoader implements CommandLineRunner {

    private final ActivityRepository activityRepository;

    @Autowired
    private EmployeeResetter resetter;

    public ActivityCSVLoader(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Override
    public void run(String... args) throws Exception {
         //Prevent duplicate inserts
        if (activityRepository.count() > 0) {
            return;
        }

        //resetter.resetActivityTable();

        List<String[]> rows;

        try (Reader reader = new InputStreamReader(
                getClass().getResourceAsStream("/data/activity.csv"))) {

            CSVReader csvReader = new CSVReader(reader);
            rows = csvReader.readAll();
        }

        // Start from 1 to skip header
        for (int i = 1; i < rows.size(); i++) {
            String[] row = rows.get(i);

            Activity activity = new Activity();
            activity.setActivityName(row[1]);
            activity.setCategory(row[2]);
            activity.setMainType(row[3]);
            activity.setSoftDelete(Boolean.parseBoolean(row[4]));

            activityRepository.save(activity);
        }

        System.out.println("✅ Activity CSV loaded successfully!");
    }
}

