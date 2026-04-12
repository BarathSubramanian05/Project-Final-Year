package com.example.project_tracking.Controller;


import com.example.project_tracking.DTO.DataTransfer;
import com.example.project_tracking.DTO.LoginRequest;
import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins="*")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request)
    {
        //System.out.println(request.getUsername()+" "+request.getPassword());
        DataTransfer emp = employeeService.userLogin(request.getUsername(),request.getPassword());
        if(emp==null){
            return new ResponseEntity<String>(HttpStatus.UNAUTHORIZED);
        }
        System.out.println(emp.toString());
        return ResponseEntity.ok(emp);
    }


    @PostMapping("/addemployee")
    public ResponseEntity<?> addEmployee(@RequestBody Employee employee)
    {
        System.out.println(employee.toString());
        employeeService.addEmployee(employee);
        return ResponseEntity.ok("Employee Added");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id)
    {
        return ResponseEntity.ok(employeeService.findEmployeeById(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get")
    public ResponseEntity<?> getById(@RequestParam long id)
    {
        DataTransfer emp = employeeService.getEmployeeById(id);
        if(emp==null){
            return new ResponseEntity<String>(HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.ok(emp);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getallmanagers")
    public ResponseEntity<?> getAllManagers(){
        return ResponseEntity.ok(employeeService.getAllManagers());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/getallemployees")
    public ResponseEntity<?> getAllEmployees(){
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/gettls")
    public ResponseEntity<?> getTlsUnderManager(@RequestParam Long mgrid){
        return ResponseEntity.ok(employeeService.getTLsUnderManager(mgrid));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/getbymgr")
    public ResponseEntity<?> getAllByManagerId(@RequestParam Long mgrid)
    {
        return ResponseEntity.ok(employeeService.getEmployeesByManagerId(mgrid));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/editemployee")
    public ResponseEntity<?> editEmployee(@RequestBody Employee employee)
    {
        return ResponseEntity.ok(employeeService.editEmployee(employee));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/soft-delete/{id}")
    public ResponseEntity<?> softDeleteEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.softDelete(id));
    }

}
