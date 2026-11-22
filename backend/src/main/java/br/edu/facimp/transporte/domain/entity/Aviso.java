package br.edu.facimp.transporte.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "avisos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Aviso {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensagem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "criado_por_id")
    private Usuario criadoPor;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;
}
