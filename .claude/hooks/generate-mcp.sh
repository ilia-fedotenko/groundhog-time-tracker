#!/bin/bash
# Generates .mcp.json from .mcp.template.json by substituting variables from .env.local
set -e

if [ ! -f .env.local ]; then
  echo "Warning: .env.local not found, .mcp.json will not be generated" >&2
  exit 0
fi

set -a
source .env.local
set +a

sed "s|\${CONTEXT7_API_KEY}|${CONTEXT7_API_KEY}|g" .mcp.template.json > .mcp.json
