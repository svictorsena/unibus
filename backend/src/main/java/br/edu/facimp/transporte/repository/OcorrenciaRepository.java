package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.Ocorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {
    List<Ocorrencia> findAllByOrderByCriadoEmDesc();
}
