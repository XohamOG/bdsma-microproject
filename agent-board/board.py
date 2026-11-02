#!/usr/bin/env python3
"""
CLI Tool for Hackathon Agent Board
Enables agents and team members to post comments, dispatch structured tasks,
update statuses, and inspect incoming inbox messages on GitHub Issue #1.
"""

import argparse
import datetime
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
STATE_PATH = BASE_DIR / "state.json"
INBOX_PATH = BASE_DIR / "inbox.json"


def load_json(path, default=None):
    """Load JSON file safely."""
    if not path.exists():
        return default if default is not None else {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Error reading {path.name}: {e}")
        return default if default is not None else {}


def save_json(path, data):
    """Save data to JSON file safely."""
    try:
        tmp_path = path.with_suffix(".tmp")
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        tmp_path.replace(path)
    except Exception:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


def get_current_commit():
    """Attempt to get current git commit hash."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            timeout=5,
        )
        return res.stdout.strip()
    except Exception:
        return "HEAD"


def get_modified_files():
    """Attempt to get recently modified or staged files via git status."""
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True,
            timeout=5,
        )
        lines = [line.strip()[3:] for line in res.stdout.strip().splitlines() if line.strip()]
        return ", ".join(lines[:5]) if lines else "None"
    except Exception:
        return "To be determined"


def post_github_comment(repo, issue, body):
    """Post comment to GitHub Issue via gh CLI."""
    try:
        cmd = [
            "gh",
            "issue",
            "comment",
            str(issue),
            "--repo",
            repo,
            "--body",
            body,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", check=True)
        comment_url = res.stdout.strip()
        return comment_url
    except subprocess.CalledProcessError as e:
        err = e.stderr.strip() if e.stderr else str(e)
        raise RuntimeError(f"GitHub CLI comment failed: {err}")


def normalize_username(user, default):
    """Normalize username to ensure @ prefix."""
    user = (user or default).strip()
    if not user.startswith("@"):
        user = "@" + user
    return user


def get_next_task_id(repo, issue):
    """Find next sequential task ID from comments and inbox."""
    highest_id = 0
    inbox = load_json(INBOX_PATH, [])
    for item in inbox:
        t_id = item.get("task_id") or ""
        m = re.match(r"TASK-(\d+)", t_id, re.IGNORECASE)
        if m:
            highest_id = max(highest_id, int(m.group(1)))

    try:
        # Check remote comments as well
        res = subprocess.run(
            ["gh", "api", f"repos/{repo}/issues/{issue}/comments", "--jq", ".[].body"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10,
        )
        if res.returncode == 0:
            for match in re.finditer(r"TASK-(\d+)", res.stdout, re.IGNORECASE):
                highest_id = max(highest_id, int(match.group(1)))
    except Exception:
        pass

    return f"TASK-{highest_id + 1:03d}"


# ==============================================================================
# CLI Commands
# ==============================================================================


def cmd_post(args, config):
    """Post a free-form message as a comment on GitHub Issue #1."""
    repo = config.get("repo")
    issue = config.get("issue")
    message = args.message.strip()

    if not message:
        print("[ERROR] Message cannot be empty.")
        sys.exit(1)

    print(f"[INFO] Posting comment to {repo} Issue #{issue}...")
    url = post_github_comment(repo, issue, message)
    print(f"✓ Comment posted successfully!")
    print(f"URL: {url}")


def cmd_task(args, config):
    """Dispatch a structured task to a teammate."""
    repo = config.get("repo")
    issue = config.get("issue")
    my_user = normalize_username(config.get("username", "xohamOG"), "xohamOG")
    teammate = normalize_username(args.to_user, config.get("teammate", "vedaXD"))
    status = (args.status or "READY").upper()

    task_id = args.id or get_next_task_id(repo, issue)
    desc = args.description.strip()
    expected = (args.expected or "Completed and verified implementation").strip()
    files = (args.files or "To be determined").strip()
    deps = (args.dependencies or "None").strip()

    body = (
        f"[TASK: {task_id}]\n"
        f"FROM: {my_user}\n"
        f"TO: {teammate}\n"
        f"STATUS: {status}\n\n"
        f"Description:\n{desc}\n\n"
        f"Expected outcome:\n{expected}\n\n"
        f"Files involved:\n{files}\n\n"
        f"Dependencies:\n{deps}"
    )

    print(f"[INFO] Dispatching {task_id} to {teammate}...")
    url = post_github_comment(repo, issue, body)
    print(f"✓ Task {task_id} assigned successfully!")
    print(f"URL: {url}")


def cmd_done(args, config):
    """Post a structured completion message for a finished task."""
    repo = config.get("repo")
    issue = config.get("issue")
    my_user = normalize_username(config.get("username", "xohamOG"), "xohamOG")
    teammate = normalize_username(args.to_user, config.get("teammate", "vedaXD"))

    task_id = args.task_id.strip()
    completed = args.details.strip()
    files = args.files or get_modified_files()
    commit = args.commit or get_current_commit()
    notes = (args.notes or "All tasks and tests verified successfully.").strip()

    body = (
        f"[TASK: {task_id}]\n"
        f"FROM: {my_user}\n"
        f"TO: {teammate}\n"
        f"STATUS: DONE\n\n"
        f"Completed:\n{completed}\n\n"
        f"Files modified:\n{files}\n\n"
        f"Commit:\n{commit}\n\n"
        f"Notes:\n{notes}"
    )

    print(f"[INFO] Posting completion update for {task_id}...")
    url = post_github_comment(repo, issue, body)
    print(f"✓ Task {task_id} marked DONE!")
    print(f"URL: {url}")


def cmd_status(args, config):
    """Inspect board status or post a task status update (READY, IN_PROGRESS, BLOCKED, DONE)."""
    repo = config.get("repo")
    issue = config.get("issue")
    my_user = normalize_username(config.get("username", "xohamOG"), "xohamOG")
    teammate = normalize_username(config.get("teammate", "vedaXD"), "vedaXD")

    # If no task_id provided, display local & board status overview
    if not args.task_id:
        print_board_status(config)
        return

    # Post a status update comment to GitHub
    task_id = args.task_id.strip()
    status = (args.status or "IN_PROGRESS").upper()
    notes = (args.notes or "").strip()

    valid_statuses = ["READY", "IN_PROGRESS", "BLOCKED", "DONE"]
    if status not in valid_statuses:
        print(f"[ERROR] Invalid status '{status}'. Must be one of: {', '.join(valid_statuses)}")
        sys.exit(1)

    if status == "BLOCKED":
        body = (
            f"[TASK: {task_id}]\n"
            f"FROM: {my_user}\n"
            f"TO: {teammate}\n"
            f"STATUS: BLOCKED\n\n"
            f"Problem:\n{notes or 'Encountered unexpected blocker.'}\n\n"
            f"Required action:\n{args.action or 'Review and advise on resolution.'}\n\n"
            f"Blocking dependency:\n{args.dependency or 'Pending teammate response.'}"
        )
    elif status == "DONE":
        body = (
            f"[TASK: {task_id}]\n"
            f"FROM: {my_user}\n"
            f"TO: {teammate}\n"
            f"STATUS: DONE\n\n"
            f"Completed:\n{notes or 'Task finished and verified.'}\n\n"
            f"Files modified:\n{args.files or get_modified_files()}\n\n"
            f"Commit:\n{args.commit or get_current_commit()}\n\n"
            f"Notes:\nNone"
        )
    elif status == "IN_PROGRESS":
        body = (
            f"[TASK: {task_id}]\n"
            f"FROM: {my_user}\n"
            f"TO: {teammate}\n"
            f"STATUS: IN_PROGRESS\n\n"
            f"Update:\n{notes or 'Acknowledged assignment. Work underway.'}\n\n"
            f"Files involved:\n{args.files or 'In progress'}"
        )
    else:  # READY
        body = (
            f"[TASK: {task_id}]\n"
            f"FROM: {my_user}\n"
            f"TO: {teammate}\n"
            f"STATUS: READY\n\n"
            f"Description:\n{notes or 'Task assigned and waiting.'}\n\n"
            f"Expected outcome:\nCompleted and verified\n\n"
            f"Files involved:\nTo be determined\n\n"
            f"Dependencies:\nNone"
        )

    print(f"[INFO] Updating {task_id} status to {status}...")
    url = post_github_comment(repo, issue, body)
    print(f"✓ Status for {task_id} updated to {status}!")
    print(f"URL: {url}")


def print_board_status(config):
    """Print detailed local and remote status."""
    repo = config.get("repo")
    issue = config.get("issue")
    username = config.get("username")
    teammate = config.get("teammate")

    state = load_json(STATE_PATH, {})
    inbox = load_json(INBOX_PATH, [])

    last_poll = state.get("last_polled_at") or "Never"
    seen_count = len(state.get("seen_comment_ids", []))
    unread_count = sum(1 for m in inbox if not m.get("read", False))

    print("=" * 64)
    print("  📋 HACKATHON AGENT BOARD STATUS OVERVIEW")
    print("=" * 64)
    print(f"  Repository:      {repo}")
    print(f"  Board Issue:     #{issue}")
    print(f"  Current User:    @{username} (PC 1)")
    print(f"  Teammate:        @{teammate} (PC 2)")
    print("-" * 64)
    print(f"  Poller State:")
    print(f"    - First run done: {state.get('first_run_completed', False)}")
    print(f"    - Last polled:    {last_poll}")
    print(f"    - Comments seen:  {seen_count}")
    print("-" * 64)
    print(f"  Local Inbox:")
    print(f"    - Total messages:  {len(inbox)}")
    print(f"    - Unread messages: {unread_count}")

    if inbox:
        print("\n  Latest Messages in Inbox:")
        for idx, item in enumerate(inbox[-5:], 1):
            read_mark = " " if item.get("read") else "● UNREAD"
            t_id = item.get("task_id") or "N/A"
            author = item.get("author", "unknown")
            snippet = item.get("body", "").replace("\n", " ")[:45]
            print(f"    [{idx}] {read_mark:<8} Task: {t_id:<10} From: @{author:<10} '{snippet}...'")
    else:
        print("    (Inbox is currently empty)")

    print("=" * 64)


def cmd_inbox(args, config):
    """Display and manage messages stored in inbox.json."""
    inbox = load_json(INBOX_PATH, [])

    if args.clear:
        save_json(INBOX_PATH, [])
        print("✓ Local inbox cleared.")
        return

    if args.mark_all_read:
        for item in inbox:
            item["read"] = True
        save_json(INBOX_PATH, inbox)
        print("✓ Marked all inbox messages as read.")
        return

    if args.mark_read:
        target_id = args.mark_read
        found = False
        for item in inbox:
            if str(item.get("id")) == str(target_id) or item.get("task_id") == target_id:
                item["read"] = True
                found = True
        if found:
            save_json(INBOX_PATH, inbox)
            print(f"✓ Marked message {target_id} as read.")
        else:
            print(f"[WARN] Message {target_id} not found in inbox.")
        return

    if args.show:
        target_id = args.show
        match = None
        for item in inbox:
            if str(item.get("id")) == str(target_id) or item.get("task_id") == target_id:
                match = item
                break
        if not match:
            print(f"[ERROR] Message {target_id} not found in inbox.")
            return

        print("=" * 70)
        print(f"  Comment ID:  {match.get('id')}")
        print(f"  Task ID:     {match.get('task_id') or 'N/A'}")
        print(f"  From:        @{match.get('author')}")
        print(f"  Status:      {match.get('status') or 'N/A'}")
        print(f"  Created At:  {match.get('created_at')}")
        print(f"  Received At: {match.get('received_at')}")
        print(f"  Read:        {match.get('read')}")
        print("-" * 70)
        print(match.get("body", ""))
        print("=" * 70)
        return

    # List messages
    items_to_show = [m for m in inbox if not args.unread or not m.get("read", False)]

    if not items_to_show:
        if args.unread:
            print("📭 No unread messages in inbox.")
        else:
            print("📭 Inbox is empty. (Run `python agent-board/poller.py` to poll for new messages)")
        return

    print("=" * 80)
    print(f"  📬 INBOX ({len(items_to_show)} message{'s' if len(items_to_show) != 1 else ''})")
    print("=" * 80)
    print(f"{'#':<3} {'STATE':<8} {'TASK ID':<12} {'FROM':<12} {'STATUS':<12} {'PREVIEW'}")
    print("-" * 80)

    for i, item in enumerate(items_to_show, 1):
        read_state = "READ" if item.get("read") else "★ UNREAD"
        task_id = item.get("task_id") or "N/A"
        from_user = f"@{item.get('author', 'unknown')}"
        status = item.get("status") or "N/A"
        preview = item.get("body", "").replace("\n", " ").strip()
        if len(preview) > 35:
            preview = preview[:32] + "..."
        print(f"{i:<3} {read_state:<8} {task_id:<12} {from_user:<12} {status:<12} {preview}")

    print("=" * 80)
    print("Tip: View full message:  python agent-board/board.py inbox --show <ID_or_TASK>")
    print("     Mark as read:       python agent-board/board.py inbox --mark-read <ID_or_TASK>")
    print("     Mark all read:      python agent-board/board.py inbox --mark-all-read")


# ==============================================================================
# Argument Parsing
# ==============================================================================


def main():
    config = load_json(CONFIG_PATH)
    if not config:
        print(f"[ERROR] Could not load configuration from {CONFIG_PATH}")
        sys.exit(1)

    parser = argparse.ArgumentParser(
        description="CLI communication board for distributed hackathon agents.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Board commands")

    # 1. post
    p_post = subparsers.add_parser("post", help="Post a free-form comment to Issue #1")
    p_post.add_argument("message", help="Message text to post")

    # 2. task
    p_task = subparsers.add_parser("task", help="Dispatch a structured task to a teammate")
    p_task.add_argument("to_user", help="Teammate GitHub username (e.g. @vedaXD)")
    p_task.add_argument("description", help="Description of the task")
    p_task.add_argument("--id", help="Task ID (e.g. TASK-001). Auto-generated if omitted")
    p_task.add_argument("--expected", help="Expected outcome / deliverables")
    p_task.add_argument("--files", help="Files involved / affected")
    p_task.add_argument("--dependencies", help="Dependencies or blockers")
    p_task.add_argument("--status", default="READY", help="Status (default: READY)")

    # 3. inbox
    p_inbox = subparsers.add_parser("inbox", help="Inspect and manage local inbox")
    p_inbox.add_argument("--show", help="Display full details of a specific comment ID or TASK-ID")
    p_inbox.add_argument("--unread", action="store_true", help="Filter by unread messages only")
    p_inbox.add_argument("--mark-read", help="Mark a message ID or TASK-ID as read")
    p_inbox.add_argument("--mark-all-read", action="store_true", help="Mark all messages as read")
    p_inbox.add_argument("--clear", action="store_true", help="Clear all messages from inbox")

    # 4. done
    p_done = subparsers.add_parser("done", help="Post completion details for a task")
    p_done.add_argument("task_id", help="Task ID (e.g. TASK-001)")
    p_done.add_argument("details", help="Completion details / summary")
    p_done.add_argument("--files", help="Files modified")
    p_done.add_argument("--commit", help="Commit hash (auto-detected if omitted)")
    p_done.add_argument("--notes", help="Additional notes")
    p_done.add_argument("--to-user", help="Recipient (defaults to teammate from config)")

    # 5. status
    p_status = subparsers.add_parser("status", help="Inspect board status or post task status update")
    p_status.add_argument("task_id", nargs="?", help="Task ID (e.g. TASK-001)")
    p_status.add_argument("status", nargs="?", help="Status: READY, IN_PROGRESS, BLOCKED, or DONE")
    p_status.add_argument("notes", nargs="?", help="Status update notes or problem description")
    p_status.add_argument("--action", help="Required action (for BLOCKED status)")
    p_status.add_argument("--dependency", help="Blocking dependency (for BLOCKED status)")
    p_status.add_argument("--files", help="Files involved")
    p_status.add_argument("--commit", help="Commit hash (for DONE status)")

    args = parser.parse_args()

    if not args.subcommand:
        parser.print_help()
        sys.exit(0)

    dispatch = {
        "post": cmd_post,
        "task": cmd_task,
        "inbox": cmd_inbox,
        "done": cmd_done,
        "status": cmd_status,
    }

    cmd_fn = dispatch.get(args.subcommand)
    if cmd_fn:
        cmd_fn(args, config)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
