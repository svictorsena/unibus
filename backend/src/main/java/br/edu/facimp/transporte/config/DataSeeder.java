package br.edu.facimp.transporte.config;

import br.edu.facimp.transporte.domain.entity.*;
import br.edu.facimp.transporte.domain.enums.PerfilUsuario;
import br.edu.facimp.transporte.domain.enums.TipoEventoCalendario;
import br.edu.facimp.transporte.dto.CadastroDTOs.RotaVeiculoConfigItem;
import br.edu.facimp.transporte.dto.CadastroDTOs.SalvarRotasDiaRequest;
import br.edu.facimp.transporte.repository.*;
import br.edu.facimp.transporte.service.RotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final UniversidadeRepository universidadeRepository;
    private final VeiculoRepository veiculoRepository;
    private final AvisoRepository avisoRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final EventoCalendarioRepository calendarioRepository;
    private final RotaService rotaService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Universidade facimp = universidadeRepository.save(Universidade.builder()
                .nome("UNIFACIMP WYDEN")
                .localizacao("Av. Prudente de Morais, s/n - Parque Sanharol")
                .build());
        Universidade uemasul = universidadeRepository.save(Universidade.builder()
                .nome("UEMASUL - Campus Imperatriz")
                .localizacao("Rua Godofredo Viana, 1300 - Centro")
                .build());
        Universidade ufma = universidadeRepository.save(Universidade.builder()
                .nome("UFMA - Campus Bom Jesus")
                .localizacao("Av. da Universidade, s/n - Dom Afonso Felipe Gregory")
                .build());
        Universidade ifma = universidadeRepository.save(Universidade.builder()
                .nome("IFMA - Campus Imperatriz")
                .localizacao("Av. Newton Bello, s/n - Vila Maria")
                .build());


        Usuario admin = usuarioRepository.save(Usuario.builder()
                .nome("Coordenação Transporte")
                .email("admin@transporte.edu.br")
                .senha(passwordEncoder.encode("123456"))
                .perfil(PerfilUsuario.ADMIN)
                .telefone("(99) 99100-0001")
                .build());

        Usuario aluno1 = usuarioRepository.save(Usuario.builder()
                .nome("Samuel Sena")
                .email("aluno@transporte.edu.br")
                .senha(passwordEncoder.encode("123456"))
                .perfil(PerfilUsuario.UNIVERSITARIO)
                .telefone("(99) 99200-4698")
                .curso("Sistemas de Informação")
                .universidade(facimp)
                .build());

        Usuario aluno2 = usuarioRepository.save(Usuario.builder()
                .nome("Mariana Costa")
                .email("mariana@transporte.edu.br")
                .senha(passwordEncoder.encode("123456"))
                .perfil(PerfilUsuario.UNIVERSITARIO)
                .telefone("(99) 99234-5678")
                .curso("Direito")
                .universidade(uemasul)
                .build());

        Usuario motorista1 = usuarioRepository.save(Usuario.builder()
                .nome("Carlos Mendes")
                .email("motorista@transporte.edu.br")
                .senha(passwordEncoder.encode("123456"))
                .perfil(PerfilUsuario.MOTORISTA)
                .telefone("(99) 99345-6789")
                .build());

        Usuario motorista2 = usuarioRepository.save(Usuario.builder()
                .nome("Roberto Alves")
                .email("roberto@transporte.edu.br")
                .senha(passwordEncoder.encode("123456"))
                .perfil(PerfilUsuario.MOTORISTA)
                .telefone("(99) 99456-7890")
                .build());


        Veiculo onibus1 = veiculoRepository.save(Veiculo.builder()
                .nome("Ônibus 01")
                .placa("PTU-2026")
                .modelo("Mercedes-Benz OF-1721")
                .capacidade(44)
                .motoristaPadrao(motorista1)
                .build());

        Veiculo onibus2 = veiculoRepository.save(Veiculo.builder()
                .nome("Ônibus 02")
                .placa("PTU-2027")
                .modelo("Marcopolo Torino")
                .capacidade(44)
                .motoristaPadrao(motorista2)
                .build());

        Veiculo micro3 = veiculoRepository.save(Veiculo.builder()
                .nome("Micro-ônibus 03")
                .placa("PTU-2028")
                .modelo("Volare W9")
                .capacidade(28)
                .build());


        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);

        rotaService.salvarConfiguracaoDoDia(new SalvarRotasDiaRequest(
                hoje,
                List.of(
                        new RotaVeiculoConfigItem(onibus1.getId(), motorista1.getId(), "18:30", List.of(facimp.getId(), uemasul.getId())),
                        new RotaVeiculoConfigItem(onibus2.getId(), motorista2.getId(), "18:40", List.of(ufma.getId(), ifma.getId())),
                        new RotaVeiculoConfigItem(micro3.getId(), null, "18:45", List.of())
                )
        ));

        rotaService.salvarConfiguracaoDoDia(new SalvarRotasDiaRequest(
                amanha,
                List.of(
                        new RotaVeiculoConfigItem(onibus1.getId(), motorista1.getId(), "18:30", List.of(facimp.getId())),
                        new RotaVeiculoConfigItem(onibus2.getId(), motorista2.getId(), "18:35", List.of(uemasul.getId(), ufma.getId())),
                        new RotaVeiculoConfigItem(micro3.getId(), null, "18:45", List.of(ifma.getId()))
                )
        ));


        avisoRepository.save(Aviso.builder()
                .titulo("Saída pontual às 18h30 na semana de avaliações")
                .mensagem("Pedimos aos universitários que estejam no ponto principal com 10 minutos de antecedência durante o período de provas.")
                .criadoPor(admin)
                .build());

        avisoRepository.save(Aviso.builder()
                .titulo("Redistribuição de frota às sextas-feiras")
                .mensagem("Devido à menor demanda às sextas-feiras, as rotas da UEMASUL e UFMA podem ser unificadas no Ônibus 02. Consulte sempre a aba 'Minha rota'.")
                .criadoPor(admin)
                .build());


        ocorrenciaRepository.save(Ocorrencia.builder()
                .tipo("Atraso")
                .descricao("Trânsito intenso na Av. Bernardo Sayão ocasionou atraso de 8 minutos na chegada ao primeiro ponto.")
                .veiculo(onibus1)
                .motorista(motorista1)
                .build());


        calendarioRepository.save(EventoCalendario.builder()
                .data(hoje)
                .descricao("Operação normal — Turno Noturno")
                .tipo(TipoEventoCalendario.DIA_LETIVO)
                .build());

        calendarioRepository.save(EventoCalendario.builder()
                .data(hoje.plusDays(3))
                .descricao("Feriado Municipal — Sem circulação do transporte universitário")
                .tipo(TipoEventoCalendario.FERIADO)
                .build());
    }
}
