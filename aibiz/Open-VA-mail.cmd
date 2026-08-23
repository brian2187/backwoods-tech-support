@echo off
cd /d "%~dp0"
start "Virtual Assistant mail" python mail_app.py
timeout /t 1 /nobreak >nul
start http://127.0.0.1:8780/
