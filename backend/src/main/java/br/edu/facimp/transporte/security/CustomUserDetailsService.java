package br.edu.facimp.transporte.security;

import br.edu.facimp.transporte.domain.entity.Usuario;
import br.edu.facimp.transporte.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario u = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
        return new User(
                u.getEmail(),
                u.getSenha(),
                u.isAtivo(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getPerfil().name()))
        );
    }
}
