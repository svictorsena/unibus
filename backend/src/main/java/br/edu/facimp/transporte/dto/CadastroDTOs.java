package br.edu.facimp.transporte.dto;

import br.edu.facimp.transporte.domain.enums.TipoEventoCalendario;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CadastroDTOs {
    public record UniversitarioRequest(
        @NotBlank(message = "Nome completo é obrigatório")
        String nome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        String senha,
        String telefone,
        String curso,

        @NotNull(message = "Universidade é obrigatória")
        UUID universidadeId
    ) {}

    public record MotoristaRequest(
        @NotBlank(message = "Nome completo é obrigatório")
        String nome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        String senha,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone
    ) {}

    public record UniversidadeRequest(
        @NotBlank(message = "Nome da universidade é obrigatório")
        String nome,

        @NotBlank(message = "Localização é obrigatória")
        String localizacao
    ) {}

    public record VeiculoRequest(
        @NotBlank(message = "Identificação do veículo é obrigatória")
        String nome,

        @NotBlank(message = "Placa é obrigatória")
        String placa,

        String modelo,

        @NotNull(message = "Capacidade é obrigatória")
        @Min(value = 1, message = "Capacidade deve ser maior que zero")
        @Max(value = 120, message = "Capacidade máxima permitida é 120")
        Integer capacidade,

        UUID motoristaId
    ) {}

    public record RotaVeiculoConfigItem(
        @NotNull UUID veiculoId,
        UUID motoristaId,
        @NotBlank String horarioPrevisto,
        @NotNull List<UUID> universidadeIds
    ) {}

    public record SalvarRotasDiaRequest(
        @NotNull LocalDate dataOperacao,
        @NotNull List<RotaVeiculoConfigItem> rotas
    ) {}

    public record AvisoRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(max = 120)
        String titulo,

        @NotBlank(message = "Mensagem é obrigatória")
        @Size(max = 1000)
        String mensagem
    ) {}

    public record OcorrenciaRequest(
        @NotBlank(message = "Tipo de ocorrência é obrigatório")
        String tipo,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(max = 1000)
        String descricao,

        UUID veiculoId
    ) {}

    public record EventoCalendarioRequest(
        @NotNull(message = "Data é obrigatória")
        LocalDate data,

        @NotBlank(message = "Descrição é obrigatória")
        String descricao,

        @NotNull(message = "Tipo é obrigatório")
        TipoEventoCalendario tipo
    ) {}

    public record AdminRequest(
            String nome,
            String email,
            String telefone,
            String senha
    ) {}

}
