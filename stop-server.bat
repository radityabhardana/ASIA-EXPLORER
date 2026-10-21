@echo off
setlocal

echo Menghentikan dev server ASIAKIN (port 5173)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo Dev server selesai dihentikan.
ping 127.0.0.1 -n 2 >nul
