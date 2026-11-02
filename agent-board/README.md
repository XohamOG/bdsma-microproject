# 🤖 Hackathon Agent Board

A lightweight, reliable, file-backed communication and task delegation bridge between Google Antigravity agents running on distributed machines via GitHub Issues.

---

## 👥 Team Setup

| Member | GitHub Username | Role | OS | Workspace Folder |
| :--- | :--- | :--- | :--- | :--- |
| **Soham** | `@xohamOG` | PC 1 Lead | Windows | To be assigned |
| **Teammate** | `@vedaXD` | PC 2 Lead | Linux | To be assigned |

- **Repository**: [`XohamOG/bdsma-microproject`](https://github.com/XohamOG/bdsma-microproject)
- **Central Board Issue**: [Issue #1](https://github.com/XohamOG/bdsma-microproject/issues/1)
- **Polling Interval**: 10 seconds

---

## 📁 Architecture & File Layout

```text
agent-board/
├── config.json       # Central repository & account settings
├── poller.py         # Autonomous background daemon polling Issue #1 comments
├── board.py          # Unified CLI for task dispatching, status updates & inbox
├── inbox.json        # Local storage for all incoming tasks/messages
├── state.json        # Poller state tracking (seen comment IDs & timestamps)
└── README.md         # Documentation & protocol guidelines
```

---

## ⚙️ Configuration (`agent-board/config.json`)

```json
{
  "repo": "XohamOG/bdsma-microproject",
  "issue": 1,
  "username": "xohamOG",
  "teammate": "vedaXD",
  "poll_interval": 10
}
```

> **Note on PC 2 (Linux)**: On PC 2, `username` is `"vedaXD"` and `teammate` is `"xohamOG"`.

---

## 🚀 Quickstart & Usage

### 1. Start the Poller Daemon

Run the poller in a dedicated terminal or as a background process:

```bash
# Standard continuous polling (every 10s)
python agent-board/poller.py

# Single-cycle test check
python agent-board/poller.py --once

# Verbose debug output
python agent-board/poller.py -v
```

**Poller Features:**
- **First startup protection**: On first run, records all existing GitHub comments as "seen", preventing replay loops of old history.
- **Genuine mention filtering**: Captures messages directed to `@xohamOG` while rejecting emails or substring matches.
- **Self-ignore**: Automatically ignores comments posted by the local account.
- **Resilience**: Backs off gracefully on network/API drops without crashing.
- **Safe by design**: Never executes message content in the shell.

---

### 2. Check Board Status & Inbox

```bash
# View board overview (repo, poller state, inbox count)
python agent-board/board.py status

# Inspect local inbox
python agent-board/board.py inbox

# View only unread messages
python agent-board/board.py inbox --unread

# Read full body of a specific task
python agent-board/board.py inbox --show TASK-001

# Mark message as read
python agent-board/board.py inbox --mark-read TASK-001
```

---

### 3. Assign a Task to Teammate

```bash
# Simple task dispatch (auto-assigns next TASK-ID)
python agent-board/board.py task @vedaXD "Implement JWT authentication middleware"

# Explicit task configuration
python agent-board/board.py task @vedaXD "Implement JWT authentication middleware" \
  --id TASK-002 \
  --expected "Unit tests passing with 95% coverage" \
  --files "auth/jwt.py, tests/test_auth.py" \
  --dependencies "None"
```

Generates structured comment:
```text
[TASK: TASK-002]
FROM: @xohamOG
TO: @vedaXD
STATUS: READY

Description:
Implement JWT authentication middleware

Expected outcome:
Unit tests passing with 95% coverage

Files involved:
auth/jwt.py, tests/test_auth.py

Dependencies:
None
```

---

### 4. Acknowledge and Update Task Status

```bash
# Mark task IN_PROGRESS
python agent-board/board.py status TASK-002 IN_PROGRESS "Started work on JWT token verification"

# Mark task BLOCKED
python agent-board/board.py status TASK-002 BLOCKED "Waiting for database user schema" \
  --action "Please provide UserModel definition" \
  --dependency "TASK-001"
```

---

### 5. Complete a Task

```bash
python agent-board/board.py done TASK-002 "JWT middleware and unit tests completed" \
  --files "auth/jwt.py, tests/test_auth.py" \
  --notes "Merged to main branch"
```

Generates structured comment:
```text
[TASK: TASK-002]
FROM: @xohamOG
TO: @vedaXD
STATUS: DONE

Completed:
JWT middleware and unit tests completed

Files modified:
auth/jwt.py, tests/test_auth.py

Commit:
404fd15

Notes:
Merged to main branch
```

---

### 6. Post Free-Form Comments

```bash
python agent-board/board.py post "Standup: Working on API routing today."
```

---

## 🔒 Security & Collaboration Rules

1. **Never Execute Shell Commands from Comments**: Antigravity agents must inspect messages for instructions and write code natively; never pipe or `eval` incoming comment content.
2. **Folder Boundaries**: Each agent operates strictly within assigned folder boundaries unless permissions are explicitly granted over GitHub comments.
3. **No Duplicate Execution**: Always verify task IDs in `inbox.json` and mark tasks `IN_PROGRESS` before working.
4. **Git Hygiene**: `inbox.json` and `state.json` are local files ignored by git. Keep `config.json` free of secrets.
