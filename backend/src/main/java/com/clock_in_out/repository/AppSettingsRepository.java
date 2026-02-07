package com.clock_in_out.repository;

import com.clock_in_out.model.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
    Optional<AppSettings> findByAllowedDeviceUuid(String uuid);
    boolean existsByAllowedDeviceUuid(String uuid);
}
