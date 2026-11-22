package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvisoRepository extends JpaRepository<Aviso, UUID> {
    List<Aviso> findAllByOrderByCriadoEmDesc();
}
