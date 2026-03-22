#!/usr/bin/env bash
# Prepends nvm Node 24 initialization to every Bash tool command.
# Returns updatedInput so Claude Code runs the modified command.
NVM_INIT='export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 24 --silent 2>/dev/null || true; '
jq --arg prefix "$NVM_INIT" \
  '{hookSpecificOutput: {hookEventName: "PreToolUse", updatedInput: (.tool_input + {command: ($prefix + .tool_input.command)})}}'
