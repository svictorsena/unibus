package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.EventoCalendario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventoCalendarioRepository extends JpaRepository<EventoCalendario, UUID> {
    List<EventoCalendario> findAllByOrderByDataAsc();
}
