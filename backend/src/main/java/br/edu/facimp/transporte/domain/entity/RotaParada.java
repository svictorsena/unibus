package br.edu.facimp.transporte.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "rota_paradas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RotaParada {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rota_diaria_id", nullable = false)
    private RotaDiaria rotaDiaria;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "universidade_id", nullable = false)
    private Universidade universidade;

    @Column(nullable = false)
    private Integer ordem;
}
