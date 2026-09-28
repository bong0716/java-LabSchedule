package com.kornec.labschedule.dto;

import lombok.*;

@Data @Builder
public class LoginResponse {
    private String token;
    private String role;
    private Long staffId;
    private String staffName;
    private boolean isFirstLogin;
}
