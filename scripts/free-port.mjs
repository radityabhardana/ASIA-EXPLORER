import { execSync } from 'node:child_process';

// Pastikan port 5173 bebas sebelum dev server dijalankan agar tidak terjadi tabrakan port
if (process.platform === 'win32') {
  try {
    execSync(
      'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"',
      { stdio: 'ignore' },
    );
  } catch {
    // Abaikan jika tidak ada proses yang berjalan
  }
}
