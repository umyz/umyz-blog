@echo off
setlocal
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":3000 .*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
start "umyz blog" /b cmd.exe /c "%~dp0start-blog.cmd"
