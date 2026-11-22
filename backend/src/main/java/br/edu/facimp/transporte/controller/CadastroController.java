package br.edu.facimp.transporte.controller;

import br.edu.facimp.transporte.domain.entity.Universidade;
import br.edu.facimp.transporte.domain.entity.Usuario;
import br.edu.facimp.transporte.domain.entity.Veiculo;
import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import br.edu.facimp.transporte.dto.AuthDTOs.UsuarioResponse;
import br.edu.facimp.transporte.dto.CadastroDTOs.*;
import br.edu.facimp.transporte.repository.UniversidadeRepository;
import br.edu.facimp.transporte.repository.UsuarioRepository;
import br.edu.facimp.transporte.repository.VeiculoRepository;
import br.edu.facimp.transporte.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CadastroController {

    private final UsuarioRepository usuarioRepository;
    private final UniversidadeRepository universidadeRepository;
    private final VeiculoRepository veiculoRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/universitarios")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponse> listarUniversitarios() {
        return usuarioRepository.findByPerfilOrderByNomeAsc(PerfilUsuario.UNIVERSITARIO)
                .stream().map(AuthService::toResponse).toList();
    }

    @PostMapping("/universitarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criarUniversitario(@Valid @RequestBody UniversitarioRequest req) {
        if (usuarioRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        Universidade uni = universidadeRepository.findById(req.universidadeId())
                .orElseThrow(() -> new IllegalArgumentException("Universidade não encontrada."));

        String senhaRaw = (req.senha() != null && !req.senha().isBlank()) ? req.senha() : "123456";

        Usuario u = Usuario.builder()
                .nome(req.nome().trim())
                .email(req.email().trim().toLowerCase())
                .senha(passwordEncoder.encode(senhaRaw))
                .perfil(PerfilUsuario.UNIVERSITARIO)
                .telefone(req.telefone())
                .curso(req.curso())
                .universidade(uni)
                .ativo(true)
                .build();

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @PutMapping("/universitarios/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'UNIVERSITARIO')")
    public ResponseEntity<UsuarioResponse> atualizarUniversitario(
            @PathVariable UUID id,
            @Valid @RequestBody UniversitarioRequest req) {

        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Universitário não encontrado."));

        boolean emailExistente = usuarioRepository.findAll().stream()
                .anyMatch(usuario -> !usuario.getId().equals(id)
                        && usuario.getEmail().equalsIgnoreCase(req.email().trim()));

        if (emailExistente) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        Universidade uni = universidadeRepository.findById(req.universidadeId())
                .orElseThrow(() -> new IllegalArgumentException("Universidade não encontrada."));

        u.setNome(req.nome().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setTelefone(req.telefone());
        u.setCurso(req.curso());
        u.setUniversidade(uni);

        if (req.senha() != null && !req.senha().isBlank()) {
            u.setSenha(passwordEncoder.encode(req.senha()));
        }

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @PatchMapping("/universitarios/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> alternarStatusUniversitario(@PathVariable UUID id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Universitário não encontrado."));

        u.setAtivo(!u.isAtivo());

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @DeleteMapping("/universitarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirUniversitario(@PathVariable UUID id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/motoristas")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponse> listarMotoristas() {
        return usuarioRepository.findByPerfilOrderByNomeAsc(PerfilUsuario.MOTORISTA)
                .stream().map(AuthService::toResponse).toList();
    }

    @PostMapping("/motoristas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criarMotorista(@Valid @RequestBody MotoristaRequest req) {
        if (usuarioRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        String senhaRaw = (req.senha() != null && !req.senha().isBlank()) ? req.senha() : "123456";

        Usuario u = Usuario.builder()
                .nome(req.nome().trim())
                .email(req.email().trim().toLowerCase())
                .senha(passwordEncoder.encode(senhaRaw))
                .perfil(PerfilUsuario.MOTORISTA)
                .telefone(req.telefone().trim())
                .ativo(true)
                .build();

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @PutMapping("/motoristas/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOTORISTA')")
    public ResponseEntity<UsuarioResponse> atualizarMotorista(
            @PathVariable UUID id,
            @Valid @RequestBody MotoristaRequest req) {

        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado."));

        boolean emailExistente = usuarioRepository.findAll().stream()
                .anyMatch(usuario -> !usuario.getId().equals(id)
                        && usuario.getEmail().equalsIgnoreCase(req.email().trim()));

        if (emailExistente) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        u.setNome(req.nome().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setTelefone(req.telefone().trim());

        if (req.senha() != null && !req.senha().isBlank()) {
            u.setSenha(passwordEncoder.encode(req.senha()));
        }

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @DeleteMapping("/motoristas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirMotorista(@PathVariable UUID id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponse> listarAdmins() {
        return usuarioRepository.findByPerfilOrderByNomeAsc(PerfilUsuario.ADMIN)
                .stream()
                .map(AuthService::toResponse)
                .toList();
    }

    @PostMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criarAdmin(
            @Valid @RequestBody AdminRequest req) {

        if (usuarioRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        String senhaRaw = (req.senha() != null && !req.senha().isBlank())
                ? req.senha()
                : "123456";

        Usuario u = Usuario.builder()
                .nome(req.nome().trim())
                .email(req.email().trim().toLowerCase())
                .senha(passwordEncoder.encode(senhaRaw))
                .perfil(PerfilUsuario.ADMIN)
                .telefone(req.telefone())
                .ativo(true)
                .build();

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @PutMapping("/admins/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> atualizarAdmin(
            @PathVariable UUID id,
            @Valid @RequestBody AdminRequest req) {

        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin não encontrado."));

        if (u.getPerfil() != PerfilUsuario.ADMIN) {
            throw new IllegalArgumentException("O usuário informado não é um administrador.");
        }

        boolean emailExistente = usuarioRepository.findAll().stream()
                .anyMatch(usuario -> !usuario.getId().equals(id)
                        && usuario.getEmail().equalsIgnoreCase(req.email().trim()));

        if (emailExistente) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        u.setNome(req.nome().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setTelefone(req.telefone());

        if (req.senha() != null && !req.senha().isBlank()) {
            u.setSenha(passwordEncoder.encode(req.senha()));
        }

        return ResponseEntity.ok(AuthService.toResponse(usuarioRepository.save(u)));
    }

    @DeleteMapping("/admins/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirAdmin(@PathVariable UUID id) {

        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin não encontrado."));

        if (u.getPerfil() != PerfilUsuario.ADMIN) {
            throw new IllegalArgumentException("O usuário informado não é um administrador.");
        }

        usuarioRepository.delete(u);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/universidades")
    public List<Universidade> listarUniversidades() {
        return universidadeRepository.findAllByOrderByNomeAsc();
    }

    @PostMapping("/universidades")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Universidade> criarUniversidade(@Valid @RequestBody UniversidadeRequest req) {
        if (universidadeRepository.existsByNomeIgnoreCase(req.nome().trim())) {
            throw new IllegalArgumentException("Universidade já cadastrada.");
        }

        Universidade uni = Universidade.builder()
                .nome(req.nome().trim())
                .localizacao(req.localizacao().trim())
                .ativa(true)
                .build();

        return ResponseEntity.ok(universidadeRepository.save(uni));
    }

    @PutMapping("/universidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Universidade> atualizarUniversidade(
            @PathVariable UUID id,
            @Valid @RequestBody UniversidadeRequest req) {

        Universidade uni = universidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Universidade não encontrada."));

        boolean nomeExistente = universidadeRepository.findAll().stream()
                .anyMatch(universidade -> !universidade.getId().equals(id)
                && universidade.getNome().equalsIgnoreCase(req.nome().trim()));

        if (nomeExistente) {
            throw new IllegalArgumentException("Universidade já cadastrada.");
        }

        uni.setNome(req.nome().trim());
        uni.setLocalizacao(req.localizacao().trim());

        return ResponseEntity.ok(universidadeRepository.save(uni));
    }

    @DeleteMapping("/universidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirUniversidade(@PathVariable UUID id) {
        universidadeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/veiculos")
    public List<Veiculo> listarVeiculos() {
        return veiculoRepository.findAllByOrderByIdAsc();
    }

    @PostMapping("/veiculos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veiculo> criarVeiculo(@Valid @RequestBody VeiculoRequest req) {
        if (veiculoRepository.existsByPlacaIgnoreCase(req.placa().trim())) {
            throw new IllegalArgumentException("Já existe um veículo cadastrado com esta placa.");
        }

        Usuario motorista = req.motoristaId() != null
                ? usuarioRepository.findById(req.motoristaId()).orElse(null)
                : null;

        Veiculo v = Veiculo.builder()
                .nome(req.nome().trim())
                .placa(req.placa().trim().toUpperCase())
                .modelo(req.modelo() != null ? req.modelo().trim() : "Ônibus Urbano")
                .capacidade(req.capacidade())
                .motoristaPadrao(motorista)
                .ativo(true)
                .build();

        return ResponseEntity.ok(veiculoRepository.save(v));
    }

    // UPDATE VEÍCULO
    @PutMapping("/veiculos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veiculo> atualizarVeiculo(
            @PathVariable UUID id,
            @Valid @RequestBody VeiculoRequest req) {

        Veiculo v = veiculoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veículo não encontrado."));

        boolean placaExistente = veiculoRepository.findAll().stream()
                .anyMatch(veiculo -> !veiculo.getId().equals(id)
                        && veiculo.getPlaca().equalsIgnoreCase(req.placa().trim()));

        if (placaExistente) {
            throw new IllegalArgumentException("Já existe um veículo cadastrado com esta placa.");
        }

        Usuario motorista = req.motoristaId() != null
                ? usuarioRepository.findById(req.motoristaId())
                  .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado."))
                : null;

        v.setNome(req.nome().trim());
        v.setPlaca(req.placa().trim().toUpperCase());
        v.setModelo(req.modelo() != null ? req.modelo().trim() : "Ônibus Urbano");
        v.setCapacidade(req.capacidade());
        v.setMotoristaPadrao(motorista);

        return ResponseEntity.ok(veiculoRepository.save(v));
    }

    @DeleteMapping("/veiculos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirVeiculo(@PathVariable UUID id) {
        veiculoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}