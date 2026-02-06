package com.clock_in_out.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AppSettings {
    @Id
    private String id = "APP_CONFIG";
    private String allowedDeviceUuid;
}
