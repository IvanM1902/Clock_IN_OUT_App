package com.clock_in_out.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "terminals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Terminal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceName; // npr. "Tatin Mobitel" ili "Tablet Salon"

    @Column(unique = true, nullable = false)
    private String deviceKey; // Jedinstveni kod koji uređaj šalje
}