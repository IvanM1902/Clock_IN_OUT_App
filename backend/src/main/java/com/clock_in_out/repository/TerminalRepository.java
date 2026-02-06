package com.clock_in_out.repository;

import com.clock_in_out.model.Terminal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TerminalRepository extends JpaRepository<Terminal, Long> {
    Optional<Terminal> findByDeviceKey(String deviceKey);
}