package br.edu.facimp.transporte.repository;

import br.edu.facimp.transporte.domain.entity.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VeiculoRepository extends JpaRepository<Veiculo, UUID> {
    List<Veiculo> findAllByOrderByIdAsc();
    boolean existsByPlacaIgnoreCase(String placa);
}
