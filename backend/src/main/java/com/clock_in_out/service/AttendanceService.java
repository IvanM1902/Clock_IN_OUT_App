package com.clock_in_out.service;

import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import com.clock_in_out.repository.AttendanceRepository;
import com.clock_in_out.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public String clockInOut(String pin) throws Exception {
        Employee employee = employeeRepository.findByPin(pin)
                .orElseThrow(() -> new Exception("Pogrešan PIN"));

        LocalDate today = LocalDate.now();
        List<Attendance> todayLogs = attendanceRepository.findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(
                employee.getId(), today.atStartOfDay(), today.atTime(LocalTime.MAX));

        boolean isSpecial = todayLogs.stream()
                .anyMatch(l -> Arrays.asList("GO", "BO", "SLOBODAN").contains(l.getType()));
        if (isSpecial) throw new Exception("Prijava nemoguća: Danas ste na GO/BO/Slobodnom danu.");

        boolean hasIn = todayLogs.stream().anyMatch(l -> "IN".equals(l.getType()));
        boolean hasOut = todayLogs.stream().anyMatch(l -> "OUT".equals(l.getType()));
        if (hasIn && hasOut) throw new Exception("Smjena za danas je već završena.");

        Optional<Attendance> lastTerminalRecord = attendanceRepository
                .findFirstByEmployeeAndTypeInOrderByTimestampDesc(employee, Arrays.asList("IN", "OUT"));

        String nextType = "IN";
        if (lastTerminalRecord.isPresent()) {
            Attendance last = lastTerminalRecord.get();
            if (last.getType().equals("IN")) {
                long minPassed = Duration.between(last.getTimestamp(), LocalDateTime.now()).toMinutes();
                if (minPassed < 5) throw new Exception("Odjava moguća tek nakon 5 min.");
                nextType = "OUT";
            }
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setType(nextType);
        attendanceRepository.save(attendance);

        return "Radnik " + employee.getName() + " uspješno " + (nextType.equals("IN") ? "PRIJAVLJEN" : "ODJAVLJEN");
    }

    public Map<LocalDate, Map<String, Object>> getMonthlyReport(Long employeeId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Attendance> logs = attendanceRepository.findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(
                employeeId, start.atStartOfDay(), end.atTime(LocalTime.MAX));

        Map<LocalDate, List<Attendance>> perDay = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getTimestamp().toLocalDate()));

        Map<LocalDate, Map<String, Object>> report = new HashMap<>();
        perDay.forEach((date, dayLogs) -> {
            Map<String, Object> dayData = new HashMap<>();

            // NOVO: Šaljemo sve logove dana na frontend za detaljni prikaz
            dayData.put("logs", dayLogs);

            Optional<Attendance> special = dayLogs.stream()
                    .filter(l -> Arrays.asList("GO", "BO", "SLOBODAN").contains(l.getType())).findFirst();

            if (special.isPresent()) {
                dayData.put("status", special.get().getType());
                dayData.put("totalMinutes", 0L);
            } else {
                long totalMinutes = 0;
                Attendance lastIn = null;
                for (Attendance log : dayLogs) {
                    if ("IN".equals(log.getType())) lastIn = log;
                    else if ("OUT".equals(log.getType()) && lastIn != null) {
                        totalMinutes += Duration.between(lastIn.getTimestamp(), log.getTimestamp()).toMinutes();
                        lastIn = null;
                    }
                }
                dayData.put("status", "WORK");
                dayData.put("totalMinutes", totalMinutes);
            }
            report.put(date, dayData);
        });
        return report;
    }

    public void setManualStatus(Long employeeId, LocalDate date, String type) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow();
        List<Attendance> dailyLogs = attendanceRepository.findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(
                employeeId, date.atStartOfDay(), date.atTime(LocalTime.MAX));
        attendanceRepository.deleteAll(dailyLogs);

        if (!type.equals("DELETE")) {
            Attendance a = new Attendance();
            a.setEmployee(employee);
            a.setTimestamp(date.atTime(8, 0));
            a.setType(type);
            attendanceRepository.save(a);
        }
    }

    public List<Attendance> getAllLastStatuses() {
        return attendanceRepository.findAll();
    }
}