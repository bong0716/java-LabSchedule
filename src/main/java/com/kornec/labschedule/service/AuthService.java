package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.LoginRequest;
import com.kornec.labschedule.dto.LoginResponse;
import com.kornec.labschedule.entity.User;
import com.kornec.labschedule.repository.UserRepository;
import com.kornec.labschedule.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (user.getStatus() == User.UserStatus.RESIGNED) {
            throw new BadCredentialsException("퇴사 처리된 계정입니다.");
        }

        boolean isFirstLogin = false;

        if (user.getStatus() == User.UserStatus.INACTIVE) {
            // First login: set password and activate
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(user);
            isFirstLogin = true;
        } else {
            // Normal login: verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
            }
        }

        Long staffId = user.getStaff() != null ? user.getStaff().getId() : null;
        String staffName = user.getStaff() != null ? user.getStaff().getName() : user.getUsername();

        String token = tokenProvider.generateToken(
                user.getUsername(),
                user.getRole().name(),
                staffId,
                staffName
        );

        return LoginResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .staffId(staffId)
                .staffName(staffName)
                .isFirstLogin(isFirstLogin)
                .build();
    }
}
