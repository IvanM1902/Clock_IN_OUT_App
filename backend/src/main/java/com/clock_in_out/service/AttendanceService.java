package com.clock_in_out.service;

import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import com.clock_in_out.repository.AttendanceRepository;
import com.clock_in_out.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public String clockInOut(String pin) {

        Employee employee = employeeRepository.findByPin(pin)
                .orElseThrow(() -> new RuntimeException("Pogrešan PIN"));

        String nextType = attendanceRepository.findFirstByEmployeeOrderByTimestampDesc(employee)
                .map(lastRecord -> lastRecord.getType().equals("IN") ? "OUT" : "IN")
                .orElse("IN");

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setType(nextType);
        attendanceRepository.save(attendance);

        return "Radnik " + employee.getName() + " uspješno prijavljen: " + nextType;
    }

    public List<Attendance> getAllLastStatuses() {
        // Ovo je jednostavan način: dohvati sve,
        // a React će filtrirati tko je zadnji (za početak)
        return attendanceRepository.findAll();
    }

}
