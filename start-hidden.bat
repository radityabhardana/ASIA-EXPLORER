@echo off
setlocal
cd /d "%~dp0"

:: Bersihkan cache dependensi vite yang usang jika ada
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite" 2>nul
)

:: Jalankan dev server di background tanpa jendela console
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c npm run dev' -WindowStyle Hidden"

echo [ASIAKIN v3] Dev server berjalan di background (port 5173).
echo Silakan buka browser di http://localhost:5173/
ping 127.0.0.1 -n 3 >nul
