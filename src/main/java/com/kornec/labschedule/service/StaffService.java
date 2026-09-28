package com.kornec.labschedule.service;

import com.kornec.labschedule.dto.StaffCreateRequest;
import com.kornec.labschedule.dto.StaffDto;
import com.kornec.labschedule.entity.ProjectMember;
import com.kornec.labschedule.entity.Staff;
import com.kornec.labschedule.entity.User;
import com.kornec.labschedule.repository.ProjectMemberRepository;
import com.kornec.labschedule.repository.StaffRepository;
import com.kornec.labschedule.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<StaffDto> getAllStaff() {
        return staffRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffDto getStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + id));
        return toDto(staff);
    }

    @Transactional
    public StaffDto createStaff(StaffCreateRequest request) {
        Staff staff = Staff.builder()
                .name(request.getName())
                .position(request.getPosition())
                .team(request.getTeam())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();
        staff = staffRepository.save(staff);

        // Create user account with email as username, INACTIVE status
        String username = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail() : request.getName();

        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .staff(staff)
                    .username(username)
                    .password("PLACEHOLDER_NOT_SET")
                    .role(User.Role.USER)
                    .status(User.UserStatus.INACTIVE)
                    .build();
            userRepository.save(user);
        }

        return toDto(staff);
    }

    private StaffDto toDto(Staff staff) {
        List<String> projectNames = memberRepository.findByStaffId(staff.getId()).stream()
                .map(pm -> pm.getProject().getName())
                .distinct()
                .collect(Collectors.toList());

        return StaffDto.builder()
                .id(staff.getId())
                .name(staff.getName())
                .position(staff.getPosition())
                .team(staff.getTeam())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .projects(projectNames)
                .build();
    }
}
