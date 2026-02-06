package com.clock_in_out.controller;

import com.clock_in_out.model.Employee;
import com.clock_in_out.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*") // Bitno za kasnije povezivanje s Reactom
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @PostMapping
    public Employee addEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        employeeRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    // Ažuriramo samo PIN jer si tako tražio
                    employee.setPin(employeeDetails.getPin());

                    // Možeš ažurirati i ostalo ako zatreba, ali za sada je fokus na PIN-u
                    employee.setName(employeeDetails.getName());
                    employee.setSurname(employeeDetails.getSurname());
                    employee.setRole(employeeDetails.getRole());
                    employee.setHireDate(employeeDetails.getHireDate());

                    Employee updatedEmployee = employeeRepository.save(employee);
                    return ResponseEntity.ok(updatedEmployee);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
