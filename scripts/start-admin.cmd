@echo off
cd /d "%~dp0.."
set "GIT_PUBLISH_ENABLED=true"
set "LOCAL_RESTART_ENABLED=true"
call npm --prefix umyz-admin start > admin.log 2> admin-error.log
