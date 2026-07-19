@echo off
cd /d "%~dp0.."
call npm --prefix umyz-admin start > admin.log 2> admin-error.log
