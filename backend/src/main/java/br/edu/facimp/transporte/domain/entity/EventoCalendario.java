package br.edu.facimp.transporte.domain.entity;

import br.edu.facimp.transporte.domain.enums.TipoEventoCalendario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "calendario_eventos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventoCalendario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 200)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoEventoCalendario tipo;
}
