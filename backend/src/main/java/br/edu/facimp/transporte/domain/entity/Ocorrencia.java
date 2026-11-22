package br.edu.facimp.transporte.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ocorrencias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ocorrencia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 60)
    private String tipo;

    @Column(nullable = false, length = 1000)
    private String descricao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "veiculo_id")
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "motorista_id")
    private Usuario motorista;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;
}
