package com.example.project_tracking.DataLoader;

import com.example.project_tracking.Model.AssignedWork;
import com.example.project_tracking.Model.WorkDetails;
import com.example.project_tracking.Repository.AssignedWorkRepository;
import com.example.project_tracking.Repository.WorkDetailsRepository;
import com.opencsv.CSVReader;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Component
@Order(4)
public class WorkDetailsCSVLoader implements CommandLineRunner {

    private final WorkDetailsRepository workDetailsRepository;

    @Autowired
    private AssignedWorkRepository assignedWorkRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public WorkDetailsCSVLoader(WorkDetailsRepository workDetailsRepository) {
        this.workDetailsRepository = workDetailsRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // ✅ Skip if already loaded (same as ProjectCSVLoader)
        if (workDetailsRepository.count() > 0) {
            // System.out.println("⏩ WorkDetails already exist, skipping CSV load.");
            return;
        }


        List<String[]> rows;

        try (Reader reader = new InputStreamReader(
                getClass().getResourceAsStream("/data/workdetails.csv"))) {

            CSVReader csvReader = new CSVReader(reader);
            rows = csvReader.readAll();
        }

        System.out.println("📥 Loading " + (rows.size() - 1) + " work details from CSV...");

        int successCount = 0;
        int errorCount = 0;

        for (int i = 1; i < rows.size(); i++) {
            try {
                String[] row = rows.get(i);

                if (row.length < 9) {
                    System.err.println("❌ Row " + i + " has insufficient columns. Skipping.");
                    errorCount++;
                    continue;
                }

                WorkDetails wd = new WorkDetails();

                // 🔗 FK: assigned_work_id
                Long assignedWorkId = parseLong(row[1]);
                if (assignedWorkId == null) {
                    System.err.println("❌ Invalid assigned_work_id at row " + i);
                    errorCount++;
                    continue;
                }

                Optional<AssignedWork> assignedWork =
                        assignedWorkRepository.findById(assignedWorkId);

                if (assignedWork.isEmpty()) {
                    System.err.println("❌ assigned_work_id not found: " + assignedWorkId);
                    errorCount++;
                    continue;
                }

                wd.setAssignedWorkId(assignedWork.get());

                // 📅 Date
                wd.setDate(parseDate(row[2]));

                // ⏱ Work hours
                wd.setWorkHours(parseDouble(row[3]));

                // ⏰ Time
                wd.setStartTime(parseTime(row[4]));
                wd.setEndTime(parseTime(row[5]));

                // 🧾 Other fields
                wd.setProjectActivity(safe(row[6]));
                wd.setAssignedWork(safe(row[7]));
                wd.setStatus(safe(row[8]));
                wd.setRemarks(row.length > 9 ? safe(row[9]) : null);

                wd.setIs_Deleted(false);

                workDetailsRepository.save(wd);
                successCount++;

            } catch (Exception e) {
                System.err.println("❌ Error loading row " + i + ": " + e.getMessage());
                errorCount++;
            }
        }

        System.out.println("✅ WorkDetails CSV loading completed!");
        System.out.println("📊 Successfully loaded: " + successCount);
        if (errorCount > 0) {
            System.out.println("⚠️ Failed to load: " + errorCount);
        }
    }

    // ================= HELPERS =================

    private String safe(String val) {
        return (val == null || val.trim().isEmpty()) ? null : val.trim();
    }

    private Double parseDouble(String val) {
        try {
            if (val == null || val.trim().isEmpty()) return 0.0;
            return Double.parseDouble(val.trim());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private Long parseLong(String val) {
        try {
            if (val == null || val.trim().isEmpty()) return null;
            return Long.parseLong(val.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        try {
            if (value == null || value.trim().isEmpty()) return null;

            if (value.contains("-") && value.indexOf("-") == 4) {
                return LocalDate.parse(value.trim()); // yyyy-MM-dd
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            return LocalDate.parse(value.trim(), formatter);

        } catch (Exception e) {
            System.err.println("Error parsing date: " + value);
            return null;
        }
    }

    private LocalTime parseTime(String value) {
        try {
            if (value == null || value.trim().isEmpty()) return null;

            if (value.length() == 5) {
                return LocalTime.parse(value, DateTimeFormatter.ofPattern("HH:mm"));
            }

            return LocalTime.parse(value);

        } catch (Exception e) {
            System.err.println("Error parsing time: " + value);
            return null;
        }
    }
}