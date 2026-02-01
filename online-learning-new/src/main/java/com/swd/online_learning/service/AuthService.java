package com.swd.online_learning.service;

import com.swd.online_learning.dto.AuthResponse;

import com.swd.online_learning.dto.request.LoginDto;
import com.swd.online_learning.entity.User;
import com.swd.online_learning.repository.UserRepository;
import com.swd.online_learning.security.JwtUtilities;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtilities jwtUtilities;

    public AuthResponse login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsername(),
                        loginDto.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtilities.generateToken(user.getUsername(), user.getRole().getRoleName().name());

        return new AuthResponse(token, user.getUsername(), user.getRole().getRoleName().name());
    }
}