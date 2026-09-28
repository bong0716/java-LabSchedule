-- ============================================================
-- Project LabFlow - PostgreSQL DDL
-- 프로젝트 스케줄 및 산출물 관리 프로그램
-- ============================================================

CREATE SCHEMA IF NOT EXISTS kornec_flow;
SET search_path TO kornec_flow;

-- 1. staff (직원)
CREATE TABLE staff (
    id            BIGSERIAL    PRIMARY KEY,
    name          VARCHAR(50)  NOT NULL,
    position      VARCHAR(20),                          
    team          VARCHAR(30),                          -- IT사업본부 / ITCore연구소
    email         VARCHAR(100),
    phone         VARCHAR(20),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. project (프로젝트)
CREATE TABLE project (
    id            BIGSERIAL    PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    code          VARCHAR(20)  NOT NULL UNIQUE,          -- SF-2026-01
    description   TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT '대기중', -- 진행중 / 대기중 / 완료 / 마감임박
    category      VARCHAR(30),                           -- 시스템 개발 / 소프트웨어 / HW 개발 / 인프라 / 연구 / 기타
    pm_id         BIGINT       REFERENCES staff(id),
    start_date    DATE,
    end_date      DATE,
    progress      SMALLINT     NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3. project_member (프로젝트 참여 인력)
CREATE TABLE project_member (
    id            BIGSERIAL    PRIMARY KEY,
    project_id    BIGINT       NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    staff_id      BIGINT       REFERENCES staff(id),     -- 내부 인력일 때
    name          VARCHAR(50)  NOT NULL,                  -- 이름 (프리랜서 포함)
    role          VARCHAR(20)  NOT NULL DEFAULT '팀원',   -- PM / 팀원 / 자문
    team          VARCHAR(30),
    mm            NUMERIC(4,1),                           -- 투입공수 M/M
    joined_date   DATE,
    is_freelancer BOOLEAN      NOT NULL DEFAULT FALSE,
    company       VARCHAR(50),                            -- 프리랜서 회사
    contact       VARCHAR(50)                             -- 프리랜서 연락처
);

-- 4. document (산출물)
CREATE TABLE document (
    id            BIGSERIAL    PRIMARY KEY,
    project_id    BIGINT       NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    category      VARCHAR(30),                            -- WBS / 보고서 / 설계서 / 계획서 / HW도면 / 소프트웨어 / 회의록 / 기타
    uploader_id   BIGINT       REFERENCES staff(id),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 5. document_version (산출물 버전)
CREATE TABLE document_version (
    id            BIGSERIAL    PRIMARY KEY,
    document_id   BIGINT       NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    version       VARCHAR(20)  NOT NULL,                  -- v1.0, v1.1, Rev1 등
    uploader_id   BIGINT       REFERENCES staff(id),
    file_size     VARCHAR(20),                            -- 2.4MB 등
    note          TEXT,                                   -- 변경 사항
    uploaded_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 6. issue (이슈)
CREATE TABLE issue (
    id            BIGSERIAL    PRIMARY KEY,
    project_id    BIGINT       NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    issue_code    VARCHAR(20)  NOT NULL,                   -- ISS-001
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT '신규',    -- 신규 / 처리중 / 보류 / 해결됨
    assignee_id   BIGINT       REFERENCES staff(id),
    reporter_id   BIGINT       REFERENCES staff(id),
    opened_date   DATE,
    due_date      DATE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 7. issue_response (이슈 대응)
CREATE TABLE issue_response (
    id            BIGSERIAL    PRIMARY KEY,
    issue_id      BIGINT       NOT NULL REFERENCES issue(id) ON DELETE CASCADE,
    author_id     BIGINT       REFERENCES staff(id),
    action        VARCHAR(20),                             -- 원인 분석 / 조치 중 / 조치 완료 / 검토 중 / 보류 / 종료
    content       TEXT         NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 8. timeline (프로젝트 활동 로그)
CREATE TABLE timeline (
    id            BIGSERIAL    PRIMARY KEY,
    project_id    BIGINT       NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    event_type    VARCHAR(20),                             -- upload / issue / change / milestone
    content       VARCHAR(300) NOT NULL,
    detail        TEXT,
    author        VARCHAR(50),
    event_date    DATE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 9. report (주간/월간 보고서)
CREATE TABLE report (
    id            BIGSERIAL    PRIMARY KEY,
    project_id    BIGINT       NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    report_type   VARCHAR(10)  NOT NULL,                   -- 주간 / 월간
    title         VARCHAR(200) NOT NULL,
    author_id     BIGINT       REFERENCES staff(id),
    report_date   DATE,
    period_start  DATE,
    period_end    DATE,
    progress      SMALLINT,
    this_period   TEXT[],                                   -- 이번 기간 실적
    next_period   TEXT[],                                   -- 다음 기간 계획
    issues        TEXT,                                     -- 특이사항
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 10. calendar_event (캘린더 이벤트)
CREATE TABLE calendar_event (
    id            BIGSERIAL    PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    event_type    VARCHAR(20)  NOT NULL,                    -- project / vacation / event
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    project_id    BIGINT       REFERENCES project(id) ON DELETE SET NULL,
    staff_id      BIGINT       REFERENCES staff(id) ON DELETE SET NULL,
    memo          TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 11. vacation (휴가 신청)
CREATE TABLE vacation (
    id             BIGSERIAL   PRIMARY KEY,
    staff_id       BIGINT      NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    vacation_type  VARCHAR(10) NOT NULL,                    -- 연차 / 반차
    start_date     DATE        NOT NULL,
    end_date       DATE        NOT NULL,
    days           NUMERIC(3,1) NOT NULL,                   -- 사용 일수 (0.5 = 반차)
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 12. users (로그인 계정 - Spring Security)
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    staff_id      BIGINT       UNIQUE REFERENCES staff(id) ON DELETE CASCADE,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password      VARCHAR(200) NOT NULL,                    -- BCrypt 해시
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',     -- ADMIN / USER
    status        VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE / INACTIVE / RESIGNED
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_project_status       ON project(status);
CREATE INDEX idx_project_pm           ON project(pm_id);
CREATE INDEX idx_project_member_proj  ON project_member(project_id);
CREATE INDEX idx_project_member_staff ON project_member(staff_id);
CREATE INDEX idx_document_proj        ON document(project_id);
CREATE INDEX idx_document_version_doc ON document_version(document_id);
CREATE INDEX idx_issue_proj           ON issue(project_id);
CREATE INDEX idx_issue_status         ON issue(status);
CREATE INDEX idx_issue_response_issue ON issue_response(issue_id);
CREATE INDEX idx_timeline_proj        ON timeline(project_id);
CREATE INDEX idx_timeline_date        ON timeline(event_date);
CREATE INDEX idx_report_proj          ON report(project_id);
CREATE INDEX idx_calendar_event_date  ON calendar_event(start_date, end_date);
CREATE INDEX idx_calendar_event_type  ON calendar_event(event_type);
CREATE INDEX idx_vacation_staff       ON vacation(staff_id);
CREATE INDEX idx_vacation_dates       ON vacation(start_date, end_date);
CREATE INDEX idx_users_staff          ON users(staff_id);
