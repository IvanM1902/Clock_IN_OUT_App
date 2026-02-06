package com.clock_in_out.controller;


import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import com.clock_in_out.repository.AttendanceRepository;
import com.clock_in_out.repository.EmployeeRepository;
import com.clock_in_out.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*") // Bitno za kasnije povezivanje s Reactom
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceController(AttendanceService attendanceService, AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceService = attendanceService;
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @DeleteMapping("/clear")
    public void clearAll(){
        attendanceRepository.deleteAll();
    }

    @PostMapping("/punch")
    public String punchCard(@RequestParam String pin){
        try {
            return attendanceService.clockInOut(pin);
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/status")
    public List<Attendance> getAllStatuses() {
        return attendanceService.getAllLastStatuses(); // ili attendanceRepository.findAll()
    }

    @PostMapping("/seed-data")
    public String seedTestData() {
        List<Employee> employees = employeeRepository.findAll();
        java.util.Random random = new java.util.Random();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        for (Employee emp : employees) {
            // Generiraj 200 zapisa (cca 100 dana rada) za svakog radnika
            for (int i = 0; i < 1000; i++) {
                // Nasumični datum u zadnjih 30 dana
                java.time.LocalDateTime randomTime = now.minusDays(random.nextInt(120))
                        .minusHours(random.nextInt(24))
                        .minusMinutes(random.nextInt(60));

                Attendance attendance = new Attendance();
                attendance.setEmployee(emp);
                attendance.setTimestamp(randomTime);
                // Par-nepar logika za IN/OUT
                attendance.setType(i % 2 == 0 ? "IN" : "OUT");

                attendanceRepository.save(attendance);
            }
        }
        return "Uspješno dodano preko 1000 testnih podataka!";
    }
}
