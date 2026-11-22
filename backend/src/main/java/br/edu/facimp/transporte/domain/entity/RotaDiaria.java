package br.edu.facimp.transporte.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "rotas_diarias",
    uniqueConstraints = @UniqueConstraint(columnNames = {"data_operacao", "veiculo_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RotaDiaria {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "data_operacao", nullable = false)
    private LocalDate dataOperacao;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "motorista_id")
    private Usuario motorista;

    @Column(name = "horario_previsto", nullable = false, length = 10)
    @Builder.Default
    private String horarioPrevisto = "18:30";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String turno = "Noturno";

    @OneToMany(mappedBy = "rotaDiaria", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<RotaParada> paradas = new ArrayList<>();
}
