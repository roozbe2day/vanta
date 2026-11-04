@echo off
cd /d "%~dp0"
python preview.py
if errorlevel 1 (
  echo.
  echo Could not start the local preview. Install Python 3 and try again.
  pause
)
