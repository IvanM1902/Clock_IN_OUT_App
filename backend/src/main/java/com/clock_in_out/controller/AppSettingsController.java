package com.clock_in_out.controller;


import com.clock_in_out.model.AppSettings;
import com.clock_in_out.repository.AppSettingsRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class AppSettingsController {

    private final AppSettingsRepository appSettingsRepository;

    public AppSettingsController(AppSettingsRepository appSettingsRepository) {
        this.appSettingsRepository = appSettingsRepository;
    }

    @PostMapping("/authorize-this-device")
    public String authorize(@RequestParam String uuid, @RequestParam String name) {
        // Ako već postoji, samo ažuriraj ime
        Optional<AppSettings> existing = appSettingsRepository.findByAllowedDeviceUuid(uuid);
        if (existing.isPresent()) {
            AppSettings s = existing.get();
            s.setDeviceName(name);
            appSettingsRepository.save(s);
            return "Ime uređaja ažurirano!";
        }

        AppSettings settings = new AppSettings(uuid, name);
        appSettingsRepository.save(settings);
        return "Uređaj uspješno dodan kao: " + name;
    }

    @GetMapping("/check-device")
    public Map<String, Boolean> check(@RequestParam String uuid) {
        boolean isAllowed = appSettingsRepository.existsByAllowedDeviceUuid(uuid);
        return Map.of("isAllowed", isAllowed);
    }

    @GetMapping("/all-devices")
    public List<AppSettings> getAllDevices() {
        return appSettingsRepository.findAll();
    }

    @DeleteMapping("/revoke-device/{id}")
    public String revokeDevice(@PathVariable Long id) {
        appSettingsRepository.deleteById(id);
        return "Device revoked successfully.";
    }
}
