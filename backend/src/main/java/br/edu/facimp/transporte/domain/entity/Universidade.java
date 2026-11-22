package br.edu.facimp.transporte.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "universidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Universidade {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 120)
    private String nome;

    @Column(nullable = false, length = 200)
    private String localizacao;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativa = true;
}
