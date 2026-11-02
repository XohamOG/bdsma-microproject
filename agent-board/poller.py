#!/usr/bin/env python3
"""
GitHub Issue Poller for Hackathon Agent Board
Polls GitHub Issue comments via GitHub CLI (`gh api`), detects incoming tasks
and messages directed to the current user, and saves them to local inbox.json.
"""

import argparse
import datetime
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Paths
BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
STATE_PATH = BASE_DIR / "state.json"
INBOX_PATH = BASE_DIR / "inbox.json"


def load_json(path, default=None):
    """Load and parse JSON file, returning default on failure or missing file."""
    if not path.exists():
        return default if default is not None else {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Failed to read {path.name}: {e}. Using default fallback.")
        return default if default is not None else {}


def save_json(path, data):
    """Safely write data to a JSON file."""
    try:
        tmp_path = path.with_suffix(".tmp")
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        tmp_path.replace(path)
    except Exception as e:
        # Fallback to direct write if replace fails
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


def fetch_comments(repo, issue):
    """Fetch all comments for the specified repository and issue using gh CLI."""
    endpoint = f"repos/{repo}/issues/{issue}/comments"
    try:
        result = subprocess.run(
            ["gh", "api", endpoint, "--paginate"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=30,
            check=True,
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.strip() if e.stderr else str(e)
        raise RuntimeError(f"gh api error: {err_msg}")
    except subprocess.TimeoutExpired:
        raise TimeoutError("GitHub CLI command timed out after 30 seconds.")
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse GitHub API response as JSON: {e}")


def is_genuine_mention(body, username):
    """Check if the comment contains a genuine @mention of username.
    Prevents matching substrings, email addresses, or extended usernames."""
    if not body or not username:
        return False
    # Case-insensitive: Not preceded by word/dot/dash, starts with @username, followed by word boundary
    pattern = r"(?i)(?<![\w.-])@" + re.escape(username) + r"\b"
    return bool(re.search(pattern, body))


def extract_metadata(body):
    """Extract structured metadata like TASK-ID and STATUS from comment body."""
    meta = {
        "task_id": None,
        "status": None,
        "description": None,
        "expected": None,
        "files": None,
        "dependencies": None,
    }
    if not body:
        return meta

    # Structured Task ID
    m_task = re.search(r"\[TASK:\s*([^\]]+)\]", body, re.IGNORECASE)
    if m_task:
        meta["task_id"] = m_task.group(1).strip()
    else:
        # Fallback: check for shorthand like TASK-001 or TEST-002
        m_simple = re.search(r"\b([A-Za-z0-9]+-[0-9]+)\b", body)
        if m_simple:
            meta["task_id"] = m_simple.group(1).strip()

    # Status
    m_status = re.search(r"STATUS:\s*([A-Za-z_]+)", body, re.IGNORECASE)
    if m_status:
        meta["status"] = m_status.group(1).strip().upper()

    # Description
    m_desc = re.search(r"Description:\s*([^\n]+)", body, re.IGNORECASE)
    if m_desc:
        meta["description"] = m_desc.group(1).strip()

    # Expected outcome
    m_exp = re.search(r"Expected outcome:\s*([^\n]+)", body, re.IGNORECASE)
    if m_exp:
        meta["expected"] = m_exp.group(1).strip()

    # Files
    m_files = re.search(r"Files(?: involved| modified)?:\s*([^\n]+)", body, re.IGNORECASE)
    if m_files:
        meta["files"] = m_files.group(1).strip()

    # Dependencies
    m_deps = re.search(r"Dependencies:\s*([^\n]+)", body, re.IGNORECASE)
    if m_deps:
        meta["dependencies"] = m_deps.group(1).strip()

    return meta


def print_notification(msg):
    """Display an eye-catching terminal alert for incoming messages."""
    border = "=" * 76
    sub_border = "-" * 76
    author = msg.get("author", "unknown")
    comment_id = msg.get("id")
    task_id = msg.get("task_id") or "N/A"
    status = msg.get("status") or "N/A"
    created = msg.get("created_at") or datetime.datetime.now().isoformat()
    body = msg.get("body", "").strip()

    print("\n" + border)
    print(f"  🔔 NEW AGENT BOARD MESSAGE RECEIVED!  [ID: {comment_id}]")
    print(sub_border)
    print(f"  FROM:     @{author}")
    print(f"  TIME:     {created}")
    print(f"  TASK ID:  {task_id}")
    print(f"  STATUS:   {status}")
    print(sub_border)
    for line in body.splitlines():
        print(f"  │ {line}")
    print(border + "\n")


def poll_cycle(config, state, inbox, verbose=False):
    """Execute one poll cycle. Returns (updated_state, updated_inbox, new_messages_count)."""
    repo = config.get("repo")
    issue = config.get("issue")
    username = config.get("username", "")

    if not repo or not issue:
        raise ValueError("Missing 'repo' or 'issue' in config.json")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    seen_ids = set(state.get("seen_comment_ids", []))
    first_run_completed = state.get("first_run_completed", False)

    comments = fetch_comments(repo, issue)

    # First startup handling: mark all existing comments as seen to avoid replaying history
    if not first_run_completed:
        for c in comments:
            seen_ids.add(c["id"])
        state["seen_comment_ids"] = sorted(list(seen_ids))
        state["first_run_completed"] = True
        state["last_polled_at"] = now_iso
        save_json(STATE_PATH, state)
        print(f"[INIT] First startup completed. Recorded {len(seen_ids)} existing comments as seen.")
        print(f"[INIT] Poller is now listening for incoming messages directed to @{username}...\n")
        return state, inbox, 0

    new_messages = []
    # Build a set of existing inbox comment IDs to prevent duplicate entries
    existing_inbox_ids = {item["id"] for item in inbox if "id" in item}

    for comment in comments:
        cid = comment.get("id")
        if cid in seen_ids:
            continue

        seen_ids.add(cid)
        author = comment.get("user", {}).get("login", "")
        body = comment.get("body", "")
        created_at = comment.get("created_at", "")

        # Ignore comments authored by the current user
        if author.lower() == username.lower():
            if verbose:
                print(f"[DEBUG] Skipping comment #{cid} authored by self (@{author}).")
            continue

        # Check for genuine mention of current user
        if not is_genuine_mention(body, username):
            if verbose:
                print(f"[DEBUG] Skipping comment #{cid}: no genuine mention of @{username}.")
            continue

        # Genuine message for current user!
        meta = extract_metadata(body)
        msg_entry = {
            "id": cid,
            "author": author,
            "created_at": created_at,
            "received_at": now_iso,
            "task_id": meta.get("task_id"),
            "status": meta.get("status"),
            "metadata": meta,
            "body": body,
            "read": False,
        }

        if cid not in existing_inbox_ids:
            inbox.append(msg_entry)
            existing_inbox_ids.add(cid)
            new_messages.append(msg_entry)
            print_notification(msg_entry)

    # Update state
    state["seen_comment_ids"] = sorted(list(seen_ids))
    state["last_polled_at"] = now_iso

    if new_messages:
        save_json(INBOX_PATH, inbox)
        save_json(STATE_PATH, state)
    else:
        # Save state periodically to record last_polled_at
        save_json(STATE_PATH, state)

    return state, inbox, len(new_messages)


def run_poller(args):
    """Main polling loop."""
    config = load_json(CONFIG_PATH)
    if not config:
        print(f"[ERROR] Could not load configuration from {CONFIG_PATH}. Please check config.json.")
        sys.exit(1)

    poll_interval = args.interval or config.get("poll_interval", 10)
    username = config.get("username", "xohamOG")
    repo = config.get("repo", "XohamOG/bdsma-microproject")
    issue = config.get("issue", 1)

    state = load_json(STATE_PATH, {"last_polled_at": None, "seen_comment_ids": [], "first_run_completed": False})
    inbox = load_json(INBOX_PATH, [])

    if args.reset_seen:
        state["seen_comment_ids"] = []
        state["first_run_completed"] = False
        save_json(STATE_PATH, state)
        print("[INFO] Poller state reset. Existing comments will be re-initialized on next run.")

    print(f"============================================================")
    print(f"  🤖 GitHub Agent Board Poller Started")
    print(f"  Target:     {repo} (Issue #{issue})")
    print(f"  Listening:  @{username}")
    print(f"  Interval:   {poll_interval}s")
    print(f"  Inbox file: {INBOX_PATH}")
    print(f"  State file: {STATE_PATH}")
    print(f"============================================================")

    if args.once:
        print("[INFO] Running in single-check mode (--once)...")
        try:
            state, inbox, count = poll_cycle(config, state, inbox, verbose=args.verbose)
            print(f"[INFO] Check complete. {count} new message(s) retrieved.")
        except Exception as e:
            print(f"[ERROR] Poll cycle failed: {e}")
            sys.exit(1)
        return

    consecutive_errors = 0
    try:
        while True:
            try:
                state, inbox, count = poll_cycle(config, state, inbox, verbose=args.verbose)
                consecutive_errors = 0
                if count > 0:
                    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Saved {count} new message(s) to inbox.json.")
                elif args.verbose:
                    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Heartbeat: No new messages.")
            except Exception as e:
                consecutive_errors += 1
                backoff = min(poll_interval * min(consecutive_errors, 5), 60)
                print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] [WARN] Polling failed ({e}). Retrying in {backoff}s...")
                time.sleep(backoff)
                continue

            time.sleep(poll_interval)
    except KeyboardInterrupt:
        print("\n[INFO] Poller stopped by user. Polling state preserved.")
        save_json(STATE_PATH, state)
        save_json(INBOX_PATH, inbox)
        sys.exit(0)


def main():
    parser = argparse.ArgumentParser(description="Poll GitHub Issue comments for Hackathon Agent Board.")
    parser.add_argument("--once", action="store_true", help="Run a single poll cycle and exit.")
    parser.add_argument("--interval", type=int, default=None, help="Override poll interval in seconds.")
    parser.add_argument("--reset-seen", action="store_true", help="Reset seen comments tracking in state.json.")
    parser.add_argument("-v", "--verbose", action="store_true", help="Show debug logs.")
    args = parser.parse_args()
    run_poller(args)


if __name__ == "__main__":
    main()
