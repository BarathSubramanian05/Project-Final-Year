package com.example.project_tracking.DataLoader;

import com.example.project_tracking.DataLoader.Reset.EmployeeResetter;
import com.example.project_tracking.Model.Project;
import com.example.project_tracking.Repository.ProjectRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Order(3)
public class ProjectCSVLoader implements CommandLineRunner {

    private final ProjectRepository projectRepository;

    @Autowired
    private EmployeeResetter employeeResetter;

    @Autowired
    public ProjectCSVLoader(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public void run(String... args) throws Exception {

//        if (projectRepository.count() > 0) {
//            //System.out.println("⏩ Projects already exist, skipping CSV load.");
//            return;
//        }

        employeeResetter.resetProjectTable();

        List<String[]> rows;
        try (Reader reader = new InputStreamReader(
                getClass().getResourceAsStream("/data/project.csv"))) {

            CSVReader csvReader = new CSVReader(reader);
            rows = csvReader.readAll();
        }

        System.out.println("📥 Loading " + (rows.size() - 1) + " projects from CSV...");

        int successCount = 0;
        int errorCount = 0;

        for (int i = 1; i < rows.size(); i++) {
            try {
                String[] row = rows.get(i);

                if (row.length < 15) {
                    System.err.println("❌ Row " + i + " has only " + row.length + " columns, expected 15. Skipping.");
                    errorCount++;
                    continue;
                }

                Project project = new Project();

                // Basic project info
                project.setProjectName(row[1].trim());
                project.setClientName(row[2].trim());
                project.setManagerId(Long.parseLong(row[3].trim()));
                project.setAssignedHours(parseBigDecimal(row[5]));
                project.setWorkingHours(parseBigDecimal(row[6]));
                project.setAssignedDate(parseDate(row[7]));
                project.setStartDate(parseDate(row[8]));
                project.setCompletedDate(parseDate(row[9]));
                project.setProjectStatus(Boolean.parseBoolean(row[10].trim()));
                project.setProjectActivityStatus(row[11]);
                project.setSoftDelete(Boolean.parseBoolean(row[12].trim()));

                // Split-up assigned hours (columns 9-11)
                project.setModellingHours(parseBigDecimal(row[14]));
                project.setCheckingHours(parseBigDecimal(row[15]));
                project.setDetailingHours(parseBigDecimal(row[16]));
                project.setStudyHours(parseBigDecimal(row[17]));

                projectRepository.save(project);
                successCount++;

//                if (successCount <= 3) {
//                    System.out.println("✅ Loaded: " + project.getProjectName() +
//                            " | Working: " + project.getWorkingHours() +
//                            " | Modelling: " + project.getModellingTime() +
//                            " | Checking: " + project.getCheckingTime() +
//                            " | Detailing: " + project.getDetailingTime());
//                }

            } catch (Exception e) {
                System.err.println("❌ Error loading project row " + i + ": " + e.getMessage());
                errorCount++;
            }
        }

        System.out.println("✅ Project CSV loading completed!");
        System.out.println("📊 Successfully loaded: " + successCount + " projects");
        if (errorCount > 0) {
            System.out.println("⚠️  Failed to load: " + errorCount + " projects");
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            if (value == null || value.trim().isEmpty()) {
                return BigDecimal.ZERO;
            }
            return new BigDecimal(value.trim());
        } catch (Exception e) {
            System.err.println("Error parsing BigDecimal: '" + value + "' - " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    private LocalDate parseDate(String value) {
        try {
            if (value == null || value.trim().isEmpty()) {
                return null; // or LocalDate.now()
            }

            // Support both formats
            if (value.contains("-") && value.indexOf("-") == 4) {
                return LocalDate.parse(value.trim()); // yyyy-MM-dd
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            return LocalDate.parse(value.trim(), formatter);

        } catch (Exception e) {
            System.err.println("Error parsing date: '" + value + "'");
            return null;
        }
    }
}