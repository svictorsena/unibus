package br.edu.facimp.transporte.dto;

import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class AuthDTOs {
    public record LoginRequest(
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "Informe um e-mail válido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        String senha
    ) {}

    public record UsuarioResponse(
        UUID id,
        String nome,
        String email,
        PerfilUsuario perfil,
        String telefone,
        String curso,
        UUID universidadeId,
        String universidadeNome,
        boolean ativo
    ) {}

    public record LoginResponse(
        String token,
        UsuarioResponse usuario
    ) {}
}
