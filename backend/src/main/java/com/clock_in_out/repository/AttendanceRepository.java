package com.clock_in_out.repository;

import com.clock_in_out.model.Attendance;
import com.clock_in_out.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // OVO JE FALILO
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Za terminal (zadnji zapis općenito)
    Optional<Attendance> findFirstByEmployeeOrderByTimestampDesc(Employee employee);

    // Za terminal (zadnji samo IN ili OUT)
    Optional<Attendance> findFirstByEmployeeAndTypeInOrderByTimestampDesc(Employee employee, List<String> types);

    // Za izvještaje i planere
    List<Attendance> findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(Long employeeId, LocalDateTime start, LocalDateTime end);

    // NOVO: Dohvaća godine u kojima postoje zapisi
    @Query("SELECT DISTINCT YEAR(a.timestamp) FROM Attendance a ORDER BY YEAR(a.timestamp) DESC")
    List<Integer> findDistinctYears();

    // NOVO: Dohvaća mjesece u kojima postoje zapisi za određenu godinu
    @Query("SELECT DISTINCT MONTH(a.timestamp) FROM Attendance a WHERE YEAR(a.timestamp) = :year ORDER BY MONTH(a.timestamp) ASC")
    List<Integer> findDistinctMonthsByYear(@Param("year") int year);
}