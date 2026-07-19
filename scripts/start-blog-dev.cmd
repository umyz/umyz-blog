@echo off
cd /d "%~dp0.."
call npm run dev > blog-dev.log 2> blog-dev-error.log
