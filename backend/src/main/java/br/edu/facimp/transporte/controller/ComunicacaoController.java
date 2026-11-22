package br.edu.facimp.transporte.controller;

import br.edu.facimp.transporte.domain.entity.*;
import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import br.edu.facimp.transporte.domain.enums.StatusSuporte;
import br.edu.facimp.transporte.dto.CadastroDTOs.*;
import br.edu.facimp.transporte.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComunicacaoController {

    private final AvisoRepository avisoRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final EventoCalendarioRepository calendarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;

    @GetMapping("/avisos")
    public List<Aviso> listarAvisos() {
        return avisoRepository.findAllByOrderByCriadoEmDesc();
    }

    @PostMapping("/avisos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Aviso> publicarAviso(Authentication auth, @Valid @RequestBody AvisoRequest req) {
        Usuario admin = usuarioRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        Aviso aviso = Aviso.builder()
                .titulo(req.titulo().trim())
                .mensagem(req.mensagem().trim())
                .criadoPor(admin)
                .build();
        return ResponseEntity.ok(avisoRepository.save(aviso));
    }

    @DeleteMapping("/avisos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirAviso(@PathVariable UUID id) {
        avisoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ocorrencias")
    public List<Ocorrencia> listarOcorrencias() {
        return ocorrenciaRepository.findAllByOrderByCriadoEmDesc();
    }

    @PostMapping("/ocorrencias")
    @PreAuthorize("hasAnyRole('MOTORISTA', 'ADMIN')")
    public ResponseEntity<Ocorrencia> registrarOcorrencia(
            Authentication auth,
            @Valid @RequestBody OcorrenciaRequest req) {
        Usuario autor = usuarioRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        Veiculo veiculo = req.veiculoId() != null
                ? veiculoRepository.findById(req.veiculoId()).orElse(null)
                : veiculoRepository.findAllByOrderByIdAsc().stream().findFirst().orElse(null);

        Ocorrencia oc = Ocorrencia.builder()
                .tipo(req.tipo().trim())
                .descricao(req.descricao().trim())
                .veiculo(veiculo)
                .motorista(autor)
                .build();
        return ResponseEntity.ok(ocorrenciaRepository.save(oc));
    }

    @GetMapping("/calendario")
    public List<EventoCalendario> listarCalendario() {
        return calendarioRepository.findAllByOrderByDataAsc();
    }

    @PostMapping("/calendario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoCalendario> criarEvento(@Valid @RequestBody EventoCalendarioRequest req) {
        EventoCalendario ev = EventoCalendario.builder()
                .data(req.data())
                .descricao(req.descricao().trim())
                .tipo(req.tipo())
                .build();
        return ResponseEntity.ok(calendarioRepository.save(ev));
    }

    @DeleteMapping("/calendario/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirEvento(@PathVariable UUID id) {
        calendarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
