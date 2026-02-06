package com.clock_in_out.repository;

import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findFirstByEmployeeOrderByTimestampDesc(Employee employee);
}
