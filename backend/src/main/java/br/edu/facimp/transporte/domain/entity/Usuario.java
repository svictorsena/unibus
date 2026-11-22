package br.edu.facimp.transporte.domain.entity;

import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 20)
    private PerfilUsuario perfil;

    @Column(length = 30)
    private String telefone;

    @Column(length = 100)
    private String curso;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "universidade_id")
    private Universidade universidade;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
