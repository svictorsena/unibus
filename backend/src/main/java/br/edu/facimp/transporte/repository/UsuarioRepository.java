package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.Usuario;
import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<Usuario> findByPerfilOrderByNomeAsc(PerfilUsuario perfil);
}
