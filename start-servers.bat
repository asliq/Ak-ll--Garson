@echo off
echo ========================================
echo Akilli Garson - Server Baslatiyor...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] JSON Server baslatiliyor (Port 3001)...
start "JSON Server" cmd /k "npm run server"

timeout /t 3 /nobreak > nul

echo [2/2] Vite Dev Server baslatiliyor (Port 5173)...
start "Vite Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Server'lar baslatildi!
echo ========================================
echo.
echo JSON Server: http://localhost:3001/
echo Frontend:    http://localhost:5173/
echo.
echo Her iki pencereyi acik tutun!
echo.
pause

