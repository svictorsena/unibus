package br.edu.facimp.transporte.controller;

import br.edu.facimp.transporte.domain.entity.RotaDiaria;
import br.edu.facimp.transporte.domain.entity.Usuario;
import br.edu.facimp.transporte.dto.CadastroDTOs.SalvarRotasDiaRequest;
import br.edu.facimp.transporte.repository.UsuarioRepository;
import br.edu.facimp.transporte.service.RotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/rotas")
@RequiredArgsConstructor
public class RotaController {

    private final RotaService rotaService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<RotaDiaria>> listarPorData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        LocalDate target = data != null ? data : LocalDate.now();
        return ResponseEntity.ok(rotaService.listarRotasPorData(target));
    }

    @GetMapping("/consulta")
    public ResponseEntity<?> consultar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam UUID universidadeId) {
        return ResponseEntity.ok(rotaService.consultarRotaPorDataEUniversidade(data, universidadeId));
    }

    @GetMapping("/minha-rota")
    public ResponseEntity<?> minhaRota(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        LocalDate target = data != null ? data : LocalDate.now();
        Usuario u = usuarioRepository.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        return switch (u.getPerfil()) {
            case UNIVERSITARIO -> {
                if (u.getUniversidade() == null) {
                    yield ResponseEntity.ok(Map.of("encontrada", false, "motivo", "Universitário sem instituição vinculada."));
                }
                yield ResponseEntity.ok(rotaService.consultarRotaPorDataEUniversidade(target, u.getUniversidade().getId()));
            }
            case MOTORISTA -> ResponseEntity.ok(rotaService.consultarRotaMotorista(target, u.getId()));
            case ADMIN -> ResponseEntity.ok(rotaService.listarRotasPorData(target));
        };
    }

    @PostMapping("/configurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RotaDiaria>> configurarDia(@Valid @RequestBody SalvarRotasDiaRequest request) {
        return ResponseEntity.ok(rotaService.salvarConfiguracaoDoDia(request));
    }
}
