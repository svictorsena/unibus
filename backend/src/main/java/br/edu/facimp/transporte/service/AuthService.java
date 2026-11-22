package br.edu.facimp.transporte.service;

import br.edu.facimp.transporte.domain.entity.Usuario;
import br.edu.facimp.transporte.dto.AuthDTOs.*;
import br.edu.facimp.transporte.repository.UsuarioRepository;
import br.edu.facimp.transporte.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim(), req.senha())
        );

        Usuario u = usuarioRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!u.isAtivo()) {
            throw new IllegalArgumentException("Usuário desativado. Contate a administração.");
        }

        String token = jwtService.generateToken(u.getEmail(), u.getPerfil().name(), u.getId());
        return new LoginResponse(token, toResponse(u));
    }

    public UsuarioResponse me(String email) {
        Usuario u = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        return toResponse(u);
    }

    public static UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPerfil(),
                u.getTelefone(),
                u.getCurso(),
                u.getUniversidade() != null ? u.getUniversidade().getId() : null,
                u.getUniversidade() != null ? u.getUniversidade().getNome() : null,
                u.isAtivo()
        );
    }
}
