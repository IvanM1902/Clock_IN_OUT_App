package com.clock_in_out.controller;

import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import com.clock_in_out.repository.AttendanceRepository;
import com.clock_in_out.repository.EmployeeRepository;
import com.clock_in_out.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
// @CrossOrigin maknut jer ga WebConfig rješava globalno
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceController(AttendanceService attendanceService, AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceService = attendanceService;
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    // 1. PUNCH (ZA TERMINAL)
    @PostMapping("/punch")
    public String punchCard(@RequestParam String pin){
        try {
            return attendanceService.clockInOut(pin);
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    // 2. REPORT (ZA PLANER)
    @GetMapping("/report/{employeeId}")
    public Map<LocalDate, Map<String, Object>> getMonthlyReport(
            @PathVariable Long employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return attendanceService.getMonthlyReport(employeeId, year, month);
    }

    // 3. MANUALNI STATUS (ZA PLANER - GO, BO, DELETE DAN)
    @PostMapping("/manual")
    public ResponseEntity<String> setManualStatus(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String type) {
        attendanceService.setManualStatus(employeeId, date, type);
        return ResponseEntity.ok("Status ažuriran");
    }

    // 4. SVI STATUSI (ZA TABLICU U ADMINU)
    @GetMapping("/status")
    public List<Attendance> getAllStatuses() {
        return attendanceRepository.findAll();
    }

    // 5. UPDATE ZAPISA (OVO TI JE FALILO - ZATO JE BILO 404)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return attendanceRepository.findById(id).map(log -> {
            if (updates.containsKey("type")) {
                log.setType(updates.get("type").toString());
            }
            if (updates.containsKey("timestamp")) {
                // Pretvaramo string iz frontenda u LocalDateTime
                String ts = updates.get("timestamp").toString();
                log.setTimestamp(java.time.LocalDateTime.parse(ts));
            }
            attendanceRepository.save(log);
            return ResponseEntity.ok("Zapis ažuriran!");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 6. DELETE ZAPISA
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        if (attendanceRepository.existsById(id)) {
            attendanceRepository.deleteById(id);
            return ResponseEntity.ok("Zapis obrisan!");
        }
        return ResponseEntity.notFound().build();
    }

    // 7. CLEAR ALL
    @DeleteMapping("/clear")
    public void clearAll(){
        attendanceRepository.deleteAll();
    }

    @GetMapping("/available-periods")
    public Map<Integer, List<Integer>> getAvailablePeriods() {
        List<Integer> years = attendanceRepository.findDistinctYears();
        Map<Integer, List<Integer>> periods = new java.util.LinkedHashMap<>();
        for (Integer year : years) {
            periods.put(year, attendanceRepository.findDistinctMonthsByYear(year));
        }
        return periods;
    }


    @PostMapping("/manual-time")
    public ResponseEntity<?> setManualTime(@RequestBody Map<String, String> payload) {
        Long empId = Long.parseLong(payload.get("employeeId"));
        String dateStr = payload.get("date"); // Format: yyyy-MM-dd
        String inTimeStr = payload.get("inTime"); // Format: HH:mm
        String outTimeStr = payload.get("outTime"); // Format: HH:mm

        Employee emp = employeeRepository.findById(empId).orElseThrow();

        // 1. Obriši SVE zapise za taj specifičan dan (uključujući GO/BO ako postoje)
        LocalDate date = LocalDate.parse(dateStr);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<Attendance> existing = attendanceRepository.findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(empId, startOfDay, endOfDay);
        attendanceRepository.deleteAll(existing);

        // 2. Kreiraj novi IN zapis
        Attendance inLog = new Attendance();
        inLog.setEmployee(emp);
        inLog.setType("IN");
        inLog.setTimestamp(LocalDateTime.parse(dateStr + "T" + inTimeStr + ":00"));
        attendanceRepository.save(inLog);

        // 3. Kreiraj novi OUT zapis
        Attendance outLog = new Attendance();
        outLog.setEmployee(emp);
        outLog.setType("OUT");
        outLog.setTimestamp(LocalDateTime.parse(dateStr + "T" + outTimeStr + ":00"));
        attendanceRepository.save(outLog);

        return ResponseEntity.ok("Vrijeme uspješno spremljeno");
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Attendance>> getDailyLogs(
            @RequestParam Long employeeId,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(23, 59, 59);

        List<Attendance> logs = attendanceRepository.findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(
                employeeId, startOfDay, endOfDay);

        return ResponseEntity.ok(logs);
    }
}