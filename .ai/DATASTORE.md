# DATASTORE.md — Single-user File Store Design

## 목적
- 별도 DB 없이 파일 기반으로 단일 사용자 설정을 영속화한다.
- Google OAuth 로그인은 1인 계정만 허용한다.
- 서버에서만 읽기/쓰기를 수행하고, 클라이언트는 API를 통해 접근한다.

## 설계 원칙
- **Single-user scope**: 단일 설정 파일만 사용.
- **Atomic write**: 임시 파일에 기록 후 rename으로 교체.
- **Server-side authorization**: 허용된 단일 계정만 CRUD 가능.
- **Schema versioning**: 파일 구조 변경을 위한 `version` 필드 유지.
- **Recoverability**: 손상/부분쓰기 대비 백업 파일 유지.

## 디렉토리 구조
```text
data/
  app/
    settings.json
  locks/
    settings.lock
  backups/
    app/
      2026-05-08T10-32-11.000Z.json
```

## 단일 설정 파일 스키마 (v1)
```json
{
  "version": 1,
  "ownerEmail": "allowed-user@example.com",
  "profile": {
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://..."
  },
  "preferences": {
    "theme": "system",
    "locale": "ko-KR"
  },
  "savedFilters": {
    "dashboardRecentFlow": {
      "eventMarket": "all",
      "eventCategories": []
    },
    "timeline": {
      "kind": "all",
      "impact": "all",
      "categories": []
    }
  },
  "watchlist": [
    { "symbol": "NVDA", "addedAt": "2026-05-08T09:00:00.000Z" }
  ],
  "notes": [
    {
      "id": "note_001",
      "targetType": "post",
      "targetId": "2026-05-13-nvidia-blackwell-demand",
      "content": "체크 포인트 업데이트 필요",
      "createdAt": "2026-05-08T09:10:00.000Z",
      "updatedAt": "2026-05-08T09:10:00.000Z"
    }
  ],
  "createdAt": "2026-05-08T09:00:00.000Z",
  "updatedAt": "2026-05-08T09:10:00.000Z"
}
```

## 파일 접근 규칙
- 파일 경로는 반드시 서버에서 생성:
  - `data/app/settings.json`
- path traversal 방지:
  - 사용자 입력 경로 직접 결합 금지
  - `path.resolve` 후 base dir prefix 검증

## Read/Write 프로토콜
1. `requireOwner()`로 세션 검증 후 허용 계정 확인
2. 파일 읽기
   - 없으면 default document 생성
3. 쓰기 시:
   - 메모리에서 patch 적용
   - `updatedAt` 갱신
   - `data/app/settings.json.tmp`에 쓰기
   - fsync(optional) 후 rename으로 본파일 교체
4. 교체 직전 백업:
   - `data/backups/app/<timestamp>.json`

## 동시성 제어
- 단일 파일 lock 또는 in-process queue 사용
- 기본 전략:
  - 단일 프로세스: 단일 Promise queue 직렬화
  - 멀티 프로세스 가능성 시: lock 파일(`wx`) + 짧은 timeout 재시도

## API 설계 (초안)
- `GET /api/app/settings`
  - 단일 설정 문서 또는 필요한 subset 반환
- `PATCH /api/app/settings`
  - 허용된 필드만 patch (`savedFilters`, `watchlist`, `notes`, `preferences`)
- `POST /api/app/notes`
- `DELETE /api/app/notes/:id`

모든 API는 서버에서 허용 계정 여부를 검증하며, 소유자 식별 필드는 body에서 받지 않는다.

## 마이그레이션 전략
- 파일마다 `version` 보유
- 읽기 시 `migrateToLatest(doc)` 호출
- 마이그레이션 함수는 순차 적용:
  - `v1 -> v2`, `v2 -> v3` ...

## 운영/보안
- 민감정보(토큰, OAuth secret)는 파일 저장 금지
- 개인 데이터 포함 가능성이 있으므로:
  - 저장 디렉토리 접근 권한 최소화(앱 프로세스만)
  - 백업 보관 주기/삭제 정책 명시
- 로그에는 이메일 전체 대신 마스킹된 식별자만 기록

## 테스트 요구사항
- 단위 테스트:
  - atomic write 성공/실패 시 복구
  - migration 함수
- 통합 테스트:
  - 허용 계정 로그인 성공
  - 비허용 계정 로그인/접근 차단(403)
  - 동시 PATCH 충돌 시 데이터 유실 없음
  - 인증 없는 요청 401

## 1차 구현 범위 (MVP)
- Google OAuth 세션 기반 owner 계정 식별
- `savedFilters.dashboardRecentFlow` 저장/복원
- 단일 설정 파일 생성/읽기/원자적 저장 유틸
- 최소 백업 1회전(최근 N개 유지)
