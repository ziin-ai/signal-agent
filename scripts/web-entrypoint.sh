#!/bin/sh
set -eu

CONTENT_ROOT="${CONTENT_ROOT:-/app/content}"
BAKED="${CONTENT_BAKED:-/app/content-baked}"

mkdir -p "$CONTENT_ROOT"
if [ -d "$BAKED" ] && [ -z "$(ls -A "$CONTENT_ROOT" 2>/dev/null || true)" ]; then
  cp -a "$BAKED"/. "$CONTENT_ROOT"/
fi

exec node ./dist/server/entry.mjs
