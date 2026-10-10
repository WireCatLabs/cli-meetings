# Cleanup

What should be removed, recorded instead of removed mid-task: the path, why, the date. Removed in
one batch after the owner confirms.

## Store 0.218.0 rollout (2026-10-10, session DB3) — all branches merged and released

- `/home/leemour/Projects/AI/cli-meetings/.worktrees/store-0218/tg-cli` and `.../max-cli` — tg #418, max #544 merged; 2026-10-10
- `/home/leemour/Projects/AI/cli-tasks/.worktrees/task-answer-verdict`, `.../release-0.3.0` — #20, #21 merged, 0.3.0 released; 2026-10-10
- `/home/leemour/Projects/AI/cli-memo/.worktrees/store-0218`, `.../release-0.6.0` — #44, #45 merged, 0.6.0 released; 2026-10-10
- `/home/leemour/Projects/AI/cli-memo/.gitignore` lacks `/.worktrees/`, so the main checkout shows it untracked — add the line, not a removal; 2026-10-10
- `/home/leemour/Projects/AI/tg-cli/.worktrees/release-0.45.0` — #419 merged, 0.45.0 released; 2026-10-10
- `/home/leemour/Projects/AI/max-cli/.worktrees/release-0.44.0`, `.../config-bot-wording` — #545, #546 merged, 0.44.0 released; 2026-10-10
- `/home/leemour/Projects/AI/cli-messaging/.worktrees/meetings-0.2.4`, `parity-0218`, `cli-tasks-0.3.0`, `release-0.219.0`, `release-0.220.0` — #843, #844, #845, #848 merged; 2026-10-10
- Remote branch `chore/release-0.219.0` on WireCatLabs/cli-messaging — a duplicate prepare, never opened as a PR (another session released 0.219.0); 2026-10-10
- `/home/leemour/Projects/AI/cli-meetings/.git/config.lock` — empty, read-only, from 16:22; it blocks `git worktree add` and upstream tracking in cli-meetings; 2026-10-10
- Local and remote branch `chore/cleanup-store-0218` in cli-meetings, once this entry is merged; 2026-10-10
