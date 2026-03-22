#!/usr/bin/env bash
# ВРЕМЕННО ОТКЛЮЧЁН (убран из settings.json → hooks.PreToolUse).
# Проблема: хук засорял каждую bash-команду длинным nvm-init префиксом.
# Ищем альтернативу: как переключиться на Node 24 один раз без засорения команд.
#
# Оригинальная идея: prepend nvm Node 24 init к каждому Bash tool вызову,
# чтобы npm/npx/node использовали Node 24 в non-interactive subshell'ах.
NVM_INIT='export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 24 --silent 2>/dev/null || true; '
jq --arg prefix "$NVM_INIT" \
  '{hookSpecificOutput: {hookEventName: "PreToolUse", updatedInput: (.tool_input + {command: ($prefix + .tool_input.command)})}}'
