package br.edu.facimp.transporte.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "veiculos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Veiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false, unique = true, length = 15)
    private String placa;

    @Column(length = 80)
    private String modelo;

    @Column(nullable = false)
    private Integer capacidade;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "motorista_id")
    private Usuario motoristaPadrao;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
