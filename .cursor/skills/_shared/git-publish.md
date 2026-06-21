# Git Publish After Skill (스킬 실행 후 커밋·푸시)

모든 프로젝트 스킬(`korea-daily-news`, `post-from-sources`, `naver-research-short-term` 등)은 **작업 완료 직후** 이 정책을 따른다.

## When To Run

**실행:** 스킬 실행으로 레포에 **파일 생성·수정**이 있었을 때 (posts, events, skills, guidebook 등).

**건너뜀:**

- 사용자가 "커밋하지 마", "push 하지 마", "git 생략" 등으로 명시
- 채팅-only 모드로 **워킹 트리 변경 없음** (예: Mode A brief-only, research-only)
- `git status` 결과 변경 없음 → empty commit 금지

## Safety Rules

- **git config 변경 금지**
- **destructive 명령 금지** (`push --force`, `reset --hard` 등) — 사용자 명시 요청 없으면 실행하지 않음
- **hook skip 금지** (`--no-verify`, `--no-gpg-sign` 등)
- **main/master force push 금지** — 요청 시 경고
- **`.env`, credentials, secrets** 커밋 금지 — staged에 있으면 unstage 후 경고
- **amend 금지** (별도 user rule — 새 커밋만)

## Workflow

스킬 본문·체크리스트·Final Response **이전**에 수행.

### 1. Parallel inspection

```bash
git status
git diff
git log -5 --oneline
```

### 2. Stage

변경된 파일만 `git add`. 스킬 산출물 예:

- `src/content/posts/`
- `src/content/events/`
- `.cursor/skills/`
- `guidebook/` (해당 시)

### 3. Commit message

HEREDOC 사용. **why** 중심, 1~2문장. 스킬·날짜·주제 반영.

```bash
git commit -m "$(cat <<'EOF'
Add 2026-06-19 naver research short-term brief post.

Daily broker report triage for short-term traders with cross-checked market data.
EOF
)"
```

스킬별 prefix 예:

| Skill | Message pattern |
| --- | --- |
| `korea-daily-news` | `Add/update {date} Korea market daily post` |
| `post-from-sources` | `Add/update post: {slug or topic}` |
| `naver-research-short-term` | `Add/update {date} broker research brief` |

### 4. Push

```bash
git push
```

원격 tracking 없으면:

```bash
git push -u origin HEAD
```

### 5. Verify

```bash
git status
```

"Your branch is up to date" 또는 push 성공 확인.

## Failure Handling

| Situation | Action |
| --- | --- |
| Pre-commit hook 실패 | hook 수정 요구사항 반영 → **새 커밋** (amend 금지) |
| Push rejected (non-fast-forward) | force push 하지 않음. 사용자에게 pull/rebase 필요 알림 |
| git 미설치·repo 아님 | 변경 파일 경로만 Final Response에 보고, git 단계 skip 사유 명시 |
| 충돌 | 사용자에게 보고, 임의 merge/force 금지 |

## Final Response Addition

스킬 Final Response 목록 **마지막 항목**으로 항상 포함:

```
9. **Git:** `{commit hash short}` pushed to `{branch}` — {1-line message}
   또는 skip 사유 (변경 없음 / 사용자 요청 / git unavailable)
```

## Opt-Out Trigger Phrases

"커밋하지 마", "push 하지 마", "git 생략", "no commit", "no push"
