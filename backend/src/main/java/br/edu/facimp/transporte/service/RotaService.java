package br.edu.facimp.transporte.service;

import br.edu.facimp.transporte.domain.entity.*;
import br.edu.facimp.transporte.dto.CadastroDTOs.RotaVeiculoConfigItem;
import br.edu.facimp.transporte.dto.CadastroDTOs.SalvarRotasDiaRequest;
import br.edu.facimp.transporte.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RotaService {

    private final RotaDiariaRepository rotaDiariaRepository;
    private final VeiculoRepository veiculoRepository;
    private final UniversidadeRepository universidadeRepository;
    private final UsuarioRepository  usuarioRepository;

    @Transactional(readOnly = true)
    public List<RotaDiaria> listarRotasPorData(LocalDate data) {
        List<Veiculo> veiculos = veiculoRepository.findAllByOrderByIdAsc();
        List<RotaDiaria> existentes = rotaDiariaRepository.findByDataOperacaoOrderByVeiculoIdAsc(data);

        Map<UUID, RotaDiaria> mapaPorVeiculo = new HashMap<>();
        for (RotaDiaria r : existentes) {
            mapaPorVeiculo.put(r.getVeiculo().getId(), r);
        }

        List<RotaDiaria> resultado = new ArrayList<>();
        for (Veiculo v : veiculos) {
            if (mapaPorVeiculo.containsKey(v.getId())) {
                resultado.add(mapaPorVeiculo.get(v.getId()));
            } else {
                resultado.add(RotaDiaria.builder()
                        .dataOperacao(data)
                        .veiculo(v)
                        .motorista(v.getMotoristaPadrao())
                        .horarioPrevisto("18:30")
                        .turno("Noturno")
                        .paradas(new ArrayList<>())
                        .build());
            }
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public Stream<RotaDiaria> consultarRotaPorDataEUniversidade(LocalDate data, UUID universidadeId) {
        return rotaDiariaRepository.findByDataOperacaoOrderByVeiculoIdAsc(data).stream()
                .filter(r -> r.getParadas().stream()
                        .anyMatch(p -> p.getUniversidade().getId().equals(universidadeId)));
    }

    @Transactional(readOnly = true)
    public Stream<RotaDiaria> consultarRotaMotorista(LocalDate data, UUID motoristaId) {
        return rotaDiariaRepository.findByDataOperacaoOrderByVeiculoIdAsc(data).stream()
                .filter(r -> (r.getMotorista() != null && r.getMotorista().getId().equals(motoristaId))
                        || (r.getVeiculo().getMotoristaPadrao() != null && r.getVeiculo().getMotoristaPadrao().getId().equals(motoristaId)));
    }

    @Transactional
    public List<RotaDiaria> salvarConfiguracaoDoDia(SalvarRotasDiaRequest req) {
        Set<UUID> usadas = new HashSet<>();
        for (RotaVeiculoConfigItem item : req.rotas()) {
            for (UUID uid : item.universidadeIds()) {
                if (!usadas.add(uid)) {
                    throw new IllegalArgumentException(
                            "A mesma universidade não pode ser atribuída a mais de um veículo na mesma data.");
                }
            }
        }

        for (RotaVeiculoConfigItem item : req.rotas()) {
            Veiculo veiculo = veiculoRepository.findById(item.veiculoId())
                    .orElseThrow(() -> new IllegalArgumentException("Veículo não encontrado: " + item.veiculoId()));

            Usuario motorista = null;
            if (item.motoristaId() != null) {
                motorista = usuarioRepository.findById(item.motoristaId()).orElse(null);
            } else {
                motorista = veiculo.getMotoristaPadrao();
            }

            RotaDiaria rota = rotaDiariaRepository
                    .findByDataOperacaoAndVeiculoId(req.dataOperacao(), veiculo.getId())
                    .orElse(RotaDiaria.builder()
                            .dataOperacao(req.dataOperacao())
                            .veiculo(veiculo)
                            .turno("Noturno")
                            .paradas(new ArrayList<>())
                            .build());

            rota.setMotorista(motorista);
            rota.setHorarioPrevisto(item.horarioPrevisto());
            rota.getParadas().clear();

            int ordem = 1;
            for (UUID uid : item.universidadeIds()) {
                Universidade uni = universidadeRepository.findById(uid)
                        .orElseThrow(() -> new IllegalArgumentException("Universidade não encontrada: " + uid));
                RotaParada parada = RotaParada.builder()
                        .rotaDiaria(rota)
                        .universidade(uni)
                        .ordem(ordem++)
                        .build();
                rota.getParadas().add(parada);
            }

            rotaDiariaRepository.save(rota);
        }

        return listarRotasPorData(req.dataOperacao());
    }
}
