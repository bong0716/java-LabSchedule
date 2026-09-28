package com.kornec.labschedule.controller;

import com.kornec.labschedule.dto.MemberAddRequest;
import com.kornec.labschedule.dto.MemberDto;
import com.kornec.labschedule.entity.*;
import com.kornec.labschedule.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final StaffRepository staffRepository;
    private final TimelineRepository timelineRepository;

    @GetMapping
    public ResponseEntity<List<MemberDto>> getMembers(@PathVariable Long projectId) {
        List<MemberDto> members = memberRepository.findByProjectId(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MemberDto> addMember(@PathVariable Long projectId, @Valid @RequestBody MemberAddRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다"));

        Staff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId()).orElse(null);
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .staff(staff)
                .name(request.getName())
                .role(request.getRole() != null ? request.getRole() : "팀원")
                .team(request.getTeam())
                .mm(request.getMm())
                .joinedDate(request.getJoinedDate() != null ? LocalDate.parse(request.getJoinedDate()) : null)
                .isFreelancer(request.isFreelancer())
                .company(request.getCompany())
                .contact(request.getContact())
                .build();
        member = memberRepository.save(member);

        // Timeline
        Timeline tl = Timeline.builder()
                .project(project)
                .eventType("change")
                .content("팀원 추가: " + request.getName())
                .eventDate(LocalDate.now())
                .build();
        timelineRepository.save(tl);

        return ResponseEntity.ok(toDto(member));
    }

    @PutMapping("/{memberId}")
    @Transactional
    public ResponseEntity<MemberDto> updateMember(@PathVariable Long projectId, @PathVariable Long memberId, @RequestBody MemberAddRequest request) {
        ProjectMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("멤버를 찾을 수 없습니다"));

        if (request.getName() != null) member.setName(request.getName());
        if (request.getRole() != null) member.setRole(request.getRole());
        if (request.getTeam() != null) member.setTeam(request.getTeam());
        if (request.getMm() != null) member.setMm(request.getMm());
        if (request.getJoinedDate() != null) member.setJoinedDate(LocalDate.parse(request.getJoinedDate()));
        if (request.getCompany() != null) member.setCompany(request.getCompany());
        if (request.getContact() != null) member.setContact(request.getContact());

        if (request.getStaffId() != null) {
            Staff staff = staffRepository.findById(request.getStaffId()).orElse(null);
            member.setStaff(staff);
        }

        return ResponseEntity.ok(toDto(memberRepository.save(member)));
    }

    @DeleteMapping("/{memberId}")
    @Transactional
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long memberId) {
        memberRepository.deleteById(memberId);
        return ResponseEntity.ok().build();
    }

    private MemberDto toDto(ProjectMember pm) {
        return MemberDto.builder()
                .id(pm.getId())
                .staffId(pm.getStaff() != null ? pm.getStaff().getId() : null)
                .name(pm.getName())
                .role(pm.getRole())
                .team(pm.getTeam())
                .mm(pm.getMm())
                .joinedDate(pm.getJoinedDate() != null ? pm.getJoinedDate().toString() : null)
                .isFreelancer(pm.getIsFreelancer())
                .company(pm.getCompany())
                .contact(pm.getContact())
                .build();
    }
}
