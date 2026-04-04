package com.example.project_tracking.Config;

import com.example.project_tracking.Model.Employee;
import com.example.project_tracking.Model.UserRole;
import com.example.project_tracking.Repository.EmployeeRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        List<GrantedAuthority> authorities = new ArrayList<>();

        for (UserRole userRole : employee.getUserRoles()) {
            authorities.add(
                    new SimpleGrantedAuthority(userRole.getRole().getName())
            );
        }

        return new User(
                employee.getUsername(),
                employee.getPassword(),
                authorities
        );
    }
}