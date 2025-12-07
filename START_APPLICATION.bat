@echo off
echo ========================================
echo  Tata Capital - AI Loan Assistant
echo ========================================
echo.
echo Starting application...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Demo Phone Numbers:
echo   9876543210 - John Doe (Pre-approved: Rs.3L, Score: 780)
echo   8765432109 - Jane Smith (Pre-approved: Rs.5L, Score: 650)
echo   7654321098 - Raj Kumar (Pre-approved: Rs.2L, Score: 820)
echo.
echo ========================================
echo.

cd /d "%~dp0"
npm start
