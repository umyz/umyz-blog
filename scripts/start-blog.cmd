@echo off
cd /d "%~dp0.."
call npm start > blog.log 2> blog-error.log
