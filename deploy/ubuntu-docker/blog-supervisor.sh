#!/usr/bin/env bash
set -eu

signal_file="/workspace/.admin/restart-blog.signal"
last_signal=""

start_blog() {
  npm start &
  blog_pid=$!
}

start_blog
while true; do
  current_signal="$(cat "$signal_file" 2>/dev/null || true)"
  if [ -n "$current_signal" ] && [ "$current_signal" != "$last_signal" ]; then
    last_signal="$current_signal"
    kill "$blog_pid" 2>/dev/null || true
    wait "$blog_pid" 2>/dev/null || true
    start_blog
  fi
  if ! kill -0 "$blog_pid" 2>/dev/null; then
    start_blog
  fi
  sleep 2
done
