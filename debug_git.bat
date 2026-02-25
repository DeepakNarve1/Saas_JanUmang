@echo off
git status
if %errorlevel% neq 0 echo Git failed with %errorlevel%
