package com.example.project_tracking.Service;
import com.example.project_tracking.DTO.AssignedWorkRequest;
import com.example.project_tracking.DTO.WorkDetailsRequest;
import com.example.project_tracking.DTO.WorkDetailsResponse;
import com.example.project_tracking.Model.*;
import com.example.project_tracking.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

@Service
public class WorkDetailsService {

    private final WorkDetailsRepository workDetailsRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ActivityRepository activityRepository;
    private final AssignedWorkRepository assignedWorkRepository;

    public WorkDetailsService(WorkDetailsRepository workDetailsRepository,
                              EmployeeRepository employeeRepository,
                              ProjectRepository projectRepository,
                              ActivityRepository activityRepository,
                              AssignedWorkRepository assignedWorkRepository) {
        this.workDetailsRepository = workDetailsRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.activityRepository = activityRepository;
        this.assignedWorkRepository = assignedWorkRepository;
    }

    public List<WorkDetailsResponse> getAll() {
        return workDetailsRepository.findAll()
                .stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<WorkDetailsResponse> getAllLogsByProjectStatus() {
        return new ArrayList<>(workDetailsRepository.findAllByActiveProjectStatus()).stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public WorkDetailsResponse saveWorkDetails(WorkDetailsRequest request) {
        WorkDetails workDetails = new WorkDetails();
        AssignedWork assignedWork=new AssignedWork();

        // ✅ Create or fetch AssignedWork
        if (request.getAssignedWorkId() == 0) {

            assignedWork = createNewAssignedWork(
                    request.getEmployeeId(),
                    request.getManagerId(),
                    request.getProjectId(),
                    request.getActivityId()
            );

        } else {
            // ✅ Otherwise, use the provided existing assignedWorkId
            assignedWork = assignedWorkRepository.findById(request.getAssignedWorkId())
                    .orElseThrow(() -> new RuntimeException("AssignedWork not found"));
        }

        // ✅ Link AssignedWork
        workDetails.setAssignedWorkId(assignedWork);

        // ✅ Set remaining fields
        workDetails.setDate(request.getDate());
        workDetails.setWorkHours(request.getWorkHours());
        workDetails.setStartTime(request.getStartTime());
        workDetails.setEndTime(request.getEndTime());
        workDetails.setProjectActivity(request.getProjectActivity());
        workDetails.setAssignedWork(request.getAssignedWork());
        workDetails.setStatus(request.getStatus());
        workDetails.setRemarks(request.getRemarks());

        // ✅ Update project working hours if workHours is provided
        if (request.getWorkHours() != null) {
            updateProjectWorkingHours(
                    assignedWork.getProject(),
                    assignedWork.getActivity(),
                    request.getWorkHours()
            );
        }

        if((request.getAssignedWork().equalsIgnoreCase(("Special Work")) || request.getAssignedWork().equalsIgnoreCase(("Idle"))) && request.getStatus().equalsIgnoreCase("pending"))
        {
            workDetails.setStatus("SPECIAL-PENDING");
            assignedWork.setStatus("SPECIAL-PENDING");
        }
        // ✅ Save WorkDetails and convert to response
        return convertToResponse(workDetailsRepository.save(workDetails));
    }



    private void updateProjectWorkingHours(Project project, Activity activity, Double workHours) {
        String mainType = activity.getMainType().toLowerCase();
        BigDecimal newWorkHours = BigDecimal.valueOf(workHours);

        // Fetch target and current hours
        BigDecimal targetHours;
        BigDecimal currentTime;
        BigDecimal currentExtraUsed = Optional.ofNullable(project.getExtraHoursTracking()).orElse(BigDecimal.ZERO);
        BigDecimal extraLimit = Optional.ofNullable(project.getExtraHours()).orElse(BigDecimal.ZERO);

        switch (mainType) {
            case "modeling":
                targetHours = Optional.ofNullable(project.getModellingHours()).orElse(BigDecimal.ZERO);
                currentTime = Optional.ofNullable(project.getModellingTime()).orElse(BigDecimal.ZERO);
                break;

            case "checking":
                targetHours = Optional.ofNullable(project.getCheckingHours()).orElse(BigDecimal.ZERO);
                currentTime = Optional.ofNullable(project.getCheckingTime()).orElse(BigDecimal.ZERO);
                break;

            case "detailing":
                targetHours = Optional.ofNullable(project.getDetailingHours()).orElse(BigDecimal.ZERO);
                currentTime = Optional.ofNullable(project.getDetailingTime()).orElse(BigDecimal.ZERO);
                break;

            case "studying":
                targetHours = Optional.ofNullable(project.getStudyHours()).orElse(BigDecimal.ZERO);
                currentTime = Optional.ofNullable(project.getStudyHoursTracking()).orElse(BigDecimal.ZERO);
                break;

            default:
                throw new RuntimeException("Unknown main_type: " + mainType);
        }

        // ✅ Case 1: Still within target hours
        if (currentTime.add(newWorkHours).compareTo(targetHours) <= 0) {
            setActivityTime(project, mainType, currentTime.add(newWorkHours));
        }
        // ✅ Case 2: Exceeds target — use extra hours
        else {
            BigDecimal extraNeeded = currentTime.add(newWorkHours).subtract(targetHours);

            if (currentExtraUsed.add(extraNeeded).compareTo(extraLimit) > 0) {
                throw new RuntimeException("Extra hours for project exceeded — approval required from AGM.");
            }

            // Update the specific activity tracking to its target limit
            setActivityTime(project, mainType, targetHours);
            // Increase extra hours tracking
            project.setExtraHoursTracking(currentExtraUsed.add(extraNeeded));
        }

        // ✅ Update total working hours
        BigDecimal totalWork = Optional.ofNullable(project.getWorkingHours()).orElse(BigDecimal.ZERO);
        project.setWorkingHours(totalWork.add(newWorkHours));

        projectRepository.save(project);
    }

    private void setActivityTime(Project project, String mainType, BigDecimal newValue) {
        switch (mainType) {
            case "modeling": project.setModellingTime(newValue); break;
            case "checking": project.setCheckingTime(newValue); break;
            case "detailing": project.setDetailingTime(newValue); break;
            case "studying": project.setStudyHoursTracking(newValue); break;
        }
    }


    public List<WorkDetailsResponse> getByEmployee(Long employeeId) {
        return workDetailsRepository.findByAssignedWorkId_Employee_EmpId(employeeId)
                .stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 4. Get all logs by manager ID
    public List<WorkDetailsResponse> getByManager(Long managerId) {
        return workDetailsRepository.findByAssignedWorkId_Manager_EmpId(managerId)
                .stream().filter(workDetails -> Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 5. Get all logs by project ID
    public List<WorkDetailsResponse> getByProject(Long projectId) {
        return workDetailsRepository.findByAssignedWorkId_Project_Id(projectId)
                .stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 6. Get all logs by activity ID
    public List<WorkDetailsResponse> getByActivity(Long activityId) {
        return workDetailsRepository.findByAssignedWorkId_Activity_Id(activityId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 7. Get logs by employee & project
    public List<WorkDetailsResponse> getByEmployeeAndProject(Long empId, Long projId) {
        return workDetailsRepository.findByEmployeeAndProject(empId, projId)
                .stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 8. Get logs by manager & project
    public List<WorkDetailsResponse> getByManagerAndProject(Long mgrId, Long projId) {
        return workDetailsRepository.findByManagerAndProject(mgrId, projId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ 9. Get logs by project & activity
    public List<WorkDetailsResponse> getByProjectAndActivity(Long projId, Long actId) {
        return workDetailsRepository.findByProjectAndActivity(projId, actId)
                .stream().filter(workDetails ->Boolean.FALSE.equals(workDetails.getIs_Deleted()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ Helper method to map entity → DTO
    private WorkDetailsResponse convertToResponse(WorkDetails work) {
        AssignedWork assigned = work.getAssignedWorkId();

        Employee emp = assigned != null ? assigned.getEmployee() : null;
        Employee mgr = assigned != null ? assigned.getManager() : null;
        Project project = assigned != null ? assigned.getProject() : null;
        Activity activity = assigned != null ? assigned.getActivity() : null;

        return new WorkDetailsResponse(
                work.getId(),
                emp != null ? emp.getName() : null,
                emp != null ? emp.getEmpId() : 0L,
                mgr != null ? mgr.getName() : null,
                mgr != null ? mgr.getEmpId() : 0L,
                project != null ? project.getProjectName() : null,
                activity != null ? activity.getActivityName() : null,
                work.getDate(),
                work.getWorkHours(),
                work.getStartTime(),
                work.getEndTime(),
                project != null ? project.getProjectActivityStatus() : null,
                work.getAssignedWork(),
                work.getStatus(),
                work.getRemarks(),
                project != null ? project.getId() : null,
                activity != null ? activity.getId() : null,
                assigned != null ? assigned.getId() : null
        );
    }

    public WorkDetailsResponse stopWork(Long employeeId) {
        WorkDetails work = workDetailsRepository
                .findTopByAssignedWorkId_Employee_EmpIdAndEndTimeIsNullOrderByIdDesc(employeeId)
                .orElseThrow(() -> new RuntimeException("No active work found for employee"));

        LocalTime startTime = work.getStartTime();
        LocalTime endTime = LocalTime.now().withNano(0); // ✅ BACKEND TIME

        Duration duration;

        // Midnight-safe calculation
        if (endTime.isBefore(startTime)) {
            duration = Duration.between(startTime, LocalTime.MIDNIGHT)
                    .plus(Duration.between(LocalTime.MIN, endTime));
        } else {
            duration = Duration.between(startTime, endTime);
        }

        double calculatedHours = duration.toMinutes() / 60.0;
        calculatedHours = Math.round(calculatedHours * 100.0) / 100.0;

        AssignedWork assignedWork = work.getAssignedWorkId();

        // Validate against project limits
        validateTargetHours(
                assignedWork.getProject(),
                assignedWork.getActivity(),
                calculatedHours,
                true
        );

        work.setEndTime(endTime);
        work.setWorkHours(calculatedHours);

        return convertToResponse(workDetailsRepository.save(work));
    }



    public WorkDetailsResponse saveFinalWork(WorkDetailsRequest request, Long activeWorkId) {
        AssignedWork as = assignedWorkRepository.findById(request.getAssignedWorkId()).orElseThrow(()-> new RuntimeException("No Assigned work found"));
        WorkDetails work = workDetailsRepository
                .findById(activeWorkId)
                .orElseThrow(() -> new RuntimeException("No work log found for assigned work"));

        if(work==null) return null;
        work.setStatus(request.getStatus());
        work.setRemarks(request.getRemarks());

        if(request.getStatus().trim().toLowerCase().equals("completed")){
            //AssignedWork assignedWork = assignedWorkRepository.findById(request.getAssignedWorkId()).orElseThrow(()-> new RuntimeException("No assigned activity found"));
            as.setStatus(request.getStatus().trim());
        }

        Project project = as.getProject();

        Activity activity = as.getActivity();

        if (request.getWorkHours() != null) {
            updateProjectWorkingHours(project, activity, request.getWorkHours());
        }

        if(request.getActivityId()==43 && request.getStatus().trim().toLowerCase().equals("pending"))
        {
            //AssignedWork assignedWork = assignedWorkRepository.findById(request.getAssignedWorkId()).orElseThrow(()-> new RuntimeException("No assigned activity found"));
            as.setStatus("SPECIAL-PENDING");
        }

        return convertToResponse(workDetailsRepository.save(work));
    }


    public WorkDetailsResponse getActiveWorkByEmployee(Long employeeId) {
        Optional<WorkDetails> workOpt = workDetailsRepository
                .findTopByEmployeeEmpIdAndEndTimeIsNullOrderByIdDesc(employeeId);

        if (workOpt.isEmpty()) return null;

        WorkDetails work = workOpt.get();

        AssignedWork assignedWork = work.getAssignedWorkId();

        String employeeName = assignedWork.getEmployee().getName();
        String managerName = assignedWork.getManager().getName();
        String projectName = assignedWork.getProject() != null ? assignedWork.getProject().getProjectName() : "";
        String activityName = assignedWork.getActivity() != null ? assignedWork.getActivity().getActivityName() : "";

        return new WorkDetailsResponse(
                work.getId(),
                employeeName,
                assignedWork.getEmployee().getEmpId(),
                managerName,
                assignedWork.getManager().getEmpId(),
                projectName,
                activityName,
                work.getDate(),
                work.getWorkHours(),
                work.getStartTime(),
                work.getEndTime(),
                work.getProjectActivity(),
                work.getAssignedWork(),
                work.getStatus(),
                work.getRemarks(),
                assignedWork.getProject().getId(),
                assignedWork.getActivity().getId(),
                work.getAssignedWorkId() != null ? work.getAssignedWorkId().getId() : null

        );
    }

    public WorkDetailsResponse getByDetailsId(Long id) {
        WorkDetails work =  workDetailsRepository.findById(id).orElse(null);
        if(work==null) return null;

        AssignedWork assignedWork = work.getAssignedWorkId();

        String employeeName = assignedWork.getEmployee().getName();
        String managerName = assignedWork.getManager().getName();
        String projectName = assignedWork.getProject() != null ? assignedWork.getProject().getProjectName() : "";
        String activityName = assignedWork.getActivity() != null ? assignedWork.getActivity().getActivityName() : "";
        return new WorkDetailsResponse(
                work.getId(),
                employeeName,
                assignedWork.getEmployee().getEmpId(),
                managerName,
                assignedWork.getManager().getEmpId(),
                projectName,
                activityName,
                work.getDate(),
                work.getWorkHours(),
                work.getStartTime(),
                work.getEndTime(),
                work.getProjectActivity(),
                work.getAssignedWork(),
                work.getStatus(),
                work.getRemarks(),
                assignedWork.getProject().getId(),
                assignedWork.getActivity().getId(),
                work.getAssignedWorkId() != null ? work.getAssignedWorkId().getId() : null
        );
    }

    private void makeChangeInActivity(Project project, String activityType, BigDecimal hrs, boolean isAdd) {
        BigDecimal extraUsed = project.getExtraHoursTracking() == null ? BigDecimal.ZERO : project.getExtraHoursTracking();

        BiFunction<BigDecimal, BigDecimal, BigDecimal> applyChange = (current, target) -> {
            if (!isAdd) return current.subtract(hrs);

            if (current.add(hrs).compareTo(target) <= 0) {
                // within normal assigned limit
                return current.add(hrs);
            } else {
                // exceeded target → use extra hours pool
                BigDecimal normalPart = target.subtract(current).max(BigDecimal.ZERO);
                BigDecimal extraPart = hrs.subtract(normalPart);
                project.setExtraHoursTracking(extraUsed.add(extraPart));
                return target.add(normalPart);
            }
        };

        switch (activityType.toLowerCase()) {
            case "modeling":
                project.setModellingTime(applyChange.apply(project.getModellingTime(), project.getModellingHours()));
                break;
            case "checking":
                project.setCheckingTime(applyChange.apply(project.getCheckingTime(), project.getCheckingHours()));
                break;
            case "detailing":
                project.setDetailingTime(applyChange.apply(project.getDetailingTime(), project.getDetailingHours()));
                break;
            case "studying":
                project.setStudyHoursTracking(applyChange.apply(project.getStudyHoursTracking(), project.getStudyHours()));
                break;
            default:
                throw new IllegalArgumentException("Invalid activity type: " + activityType);
        }

        // Update total working time (common for all)
        if (isAdd) {
            project.setWorkingHours(project.getWorkingHours().add(hrs));
        } else {
            project.setWorkingHours(project.getWorkingHours().subtract(hrs));
        }

        projectRepository.save(project);
    }


    private void validateTargetHours(Project project, Activity activity, double newHours, boolean isAdd) {
        if (!isAdd) return; // no need to validate removals

        String type = activity.getMainType().toLowerCase();
        BigDecimal hrs = BigDecimal.valueOf(newHours);

        // Retrieve existing times safely
        BigDecimal modTime = Optional.ofNullable(project.getModellingTime()).orElse(BigDecimal.ZERO);
        BigDecimal modTarget = Optional.ofNullable(project.getModellingHours()).orElse(BigDecimal.ZERO);

        BigDecimal chkTime = Optional.ofNullable(project.getCheckingTime()).orElse(BigDecimal.ZERO);
        BigDecimal chkTarget = Optional.ofNullable(project.getCheckingHours()).orElse(BigDecimal.ZERO);

        BigDecimal detTime = Optional.ofNullable(project.getDetailingTime()).orElse(BigDecimal.ZERO);
        BigDecimal detTarget = Optional.ofNullable(project.getDetailingHours()).orElse(BigDecimal.ZERO);

        BigDecimal studyTime = Optional.ofNullable(project.getStudyHoursTracking()).orElse(BigDecimal.ZERO);
        BigDecimal studyTarget = Optional.ofNullable(project.getStudyHours()).orElse(BigDecimal.ZERO);

        // Extra hour fields
        BigDecimal extraLimit = Optional.ofNullable(project.getExtraHours()).orElse(BigDecimal.ZERO);
        BigDecimal extraUsed = Optional.ofNullable(project.getExtraHoursTracking()).orElse(BigDecimal.ZERO);

        // Get current time & target for the activity type
        BigDecimal currentTime, targetTime;

        switch (type) {
            case "modeling": currentTime = modTime; targetTime = modTarget; break;
            case "checking": currentTime = chkTime; targetTime = chkTarget; break;
            case "detailing": currentTime = detTime; targetTime = detTarget; break;
            case "studying": currentTime = studyTime; targetTime = studyTarget; break;
            default: throw new RuntimeException("Unknown activity type: " + type);
        }

        // 1️⃣ Normal activity limit check
        if (currentTime.add(hrs).compareTo(targetTime) <= 0) {
            // within target - all good
            return;
        }

        // 2️⃣ Activity limit reached — now check project-level extra hours
        BigDecimal totalExtraNeed = currentTime.add(hrs).subtract(targetTime);
        BigDecimal remainingExtra = extraLimit.subtract(extraUsed);

        if (remainingExtra.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Assigned hours for " + type + " reached. AGM approval required for extra hours.");
        }

        // 3️⃣ Check if remaining extra is enough
        if (totalExtraNeed.compareTo(remainingExtra) > 0) {
            throw new RuntimeException("Extra hours for project exceeded — approval required from AGM.");
        }
    }




    @Transactional
    public WorkDetailsResponse editWorkDetail(long id, WorkDetailsRequest request) {
        WorkDetails oldWork = workDetailsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work detail not found for id: " + id));

        Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Project newProject = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Activity newActivity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        double oldHours = Optional.ofNullable(oldWork.getWorkHours()).orElse(0.0);
        double newHours = Optional.ofNullable(request.getWorkHours()).orElse(oldHours);

        Project oldProject = oldWork.getAssignedWorkId().getProject();
        Activity oldActivity = oldWork.getAssignedWorkId().getActivity();

        boolean projectChanged = !Objects.equals(oldProject.getId(), newProject.getId());
        boolean activityChanged = !Objects.equals(oldActivity.getMainType(), newActivity.getMainType());
        boolean hoursChanged = Double.compare(oldHours, newHours) != 0;

        if (projectChanged || activityChanged || hoursChanged) {
            // Remove old time from the old project/activity
            makeChangeInActivity(oldProject, oldActivity.getMainType(),  BigDecimal.valueOf(oldHours),false);

            // Validate and apply new hours to the new project/activity
            validateTargetHours(newProject, newActivity, newHours, true);
            makeChangeInActivity(newProject, newActivity.getMainType(), BigDecimal.valueOf(newHours),true);
        }

        // Update entity fields
        oldWork.getAssignedWorkId().setManager(manager);
        oldWork.getAssignedWorkId().setProject(newProject);
        oldWork.getAssignedWorkId().setActivity(newActivity);
        oldWork.setDate(request.getDate());
        oldWork.setWorkHours(newHours);
        oldWork.setStartTime(request.getStartTime());
        oldWork.setEndTime(request.getEndTime());
        oldWork.setProjectActivity(request.getProjectActivity());
        oldWork.setAssignedWork(request.getAssignedWork());
        oldWork.setStatus(request.getStatus());
        oldWork.setRemarks(request.getRemarks());

        return convertToResponse(workDetailsRepository.save(oldWork));
    }



    public void discardWork(Long workId) {
        WorkDetails work = workDetailsRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work entry not found for ID: " + workId));
        //System.out.println(work.toString());
        workDetailsRepository.delete(work);
    }

    private AssignedWork findOrCreateAssignedWork(Long employeeId, Long managerId, Long projectId, Long activityId) {
        // 1️⃣ Check if assigned work already exists
        Optional<AssignedWork> existing = assignedWorkRepository
                .findByEmployee_EmpIdAndManager_EmpIdAndProject_IdAndActivity_Id(
                        employeeId, managerId, projectId, activityId);

        if (existing.isPresent()) return existing.get();
        // 2️⃣ Else, create new AssignedWork
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Employee mgr = employeeRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        Project proj = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Activity act = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        AssignedWork assigned = new AssignedWork();
        assigned.setEmployee(emp);
        assigned.setManager(mgr);
        assigned.setProject(proj);
        assigned.setActivity(act);
        assigned.setStatus("assigned"); // default initial status

        return assignedWorkRepository.save(assigned);
    }

    private AssignedWork createNewAssignedWork(Long employeeId, Long managerId, Long projectId, Long activityId) {
        // 1️⃣ Fetch all related entities
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Employee mgr = employeeRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        Project proj = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Activity act = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // 2️⃣ Create new AssignedWork
        AssignedWork assigned = new AssignedWork();
        assigned.setEmployee(emp);
        assigned.setManager(mgr);
        assigned.setProject(proj);
        assigned.setActivity(act);
        assigned.setAssignedBy(mgr); // usually the manager assigning the work
        assigned.setDescription("Special Work created on " + java.time.LocalDate.now());
        assigned.setAssignedDate(java.time.LocalDate.now());
        assigned.setStatus("PENDING");
        assigned.setDeleted(false);

        // 3️⃣ Save and return
        return assignedWorkRepository.save(assigned);
    }



    public WorkDetailsResponse getAssignedWork(Long id) {
        WorkDetails work = workDetailsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work entry not found for ID: " + id));
        //System.out.println(work.toString());
        //System.out.println(work.getAssignedWorkId().getId());
        return convertToResponse(work);
    }
}

