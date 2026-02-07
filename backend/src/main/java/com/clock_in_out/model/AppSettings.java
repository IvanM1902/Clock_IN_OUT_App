package com.clock_in_out.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AppSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String allowedDeviceUuid;

    private String deviceName;

    // DODAJ OVAJ KONSTRUKTOR RUČNO:
    public AppSettings(String uuid, String name) {
        this.allowedDeviceUuid = uuid;
        this.deviceName = name;
    }
}