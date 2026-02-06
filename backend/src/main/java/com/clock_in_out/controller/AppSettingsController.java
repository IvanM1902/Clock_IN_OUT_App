package com.clock_in_out.controller;


import com.clock_in_out.model.AppSettings;
import com.clock_in_out.repository.AppSettingsRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class AppSettingsController {

    private final AppSettingsRepository appSettingsRepository;

    public AppSettingsController(AppSettingsRepository appSettingsRepository) {
        this.appSettingsRepository = appSettingsRepository;
    }

    @PostMapping("/authorize-this-device")
    public String authorize(@RequestParam String uuid) {
        AppSettings settings = appSettingsRepository.findById("APP_CONFIG")
                .orElse(new AppSettings("APP_CONFIG", uuid));
        settings.setAllowedDeviceUuid(uuid);
        appSettingsRepository.save(settings);
        return "Uređaj uspješno autoriziran!";
    }

    @GetMapping("/check-device")
    public Map<String, Boolean> check(@RequestParam String uuid) {
        String allowed = appSettingsRepository.findById("APP_CONFIG")
                .map(AppSettings::getAllowedDeviceUuid)
                .orElse("");
        return Map.of("isAllowed", uuid.equals(allowed));
    }
}
