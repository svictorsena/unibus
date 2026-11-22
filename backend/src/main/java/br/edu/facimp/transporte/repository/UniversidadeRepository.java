package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.Universidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UniversidadeRepository extends JpaRepository<Universidade, UUID> {
    List<Universidade> findAllByOrderByNomeAsc();
    boolean existsByNomeIgnoreCase(String nome);
}
