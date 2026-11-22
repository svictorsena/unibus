package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.RotaDiaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RotaDiariaRepository extends JpaRepository<RotaDiaria, UUID> {
    List<RotaDiaria> findByDataOperacaoOrderByVeiculoIdAsc(LocalDate dataOperacao);
    Optional<RotaDiaria> findByDataOperacaoAndVeiculoId(LocalDate dataOperacao, UUID veiculoId);
    void deleteByDataOperacao(LocalDate dataOperacao);
}
