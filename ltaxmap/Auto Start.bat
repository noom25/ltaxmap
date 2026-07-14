@echo off
title LTAX WebGIS - Auto Setup & Network
cd /d %~dp0
cls

:: บอกทางไป PHP (Path) 
SET "PATH=%PATH%;D:\test\php"

:: เช็คว่ารันด้วย Admin หรือไม่ 
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ========================================
    echo   ⚠️  ต้องรันด้วยสิทธิ์ Administrator
    echo ========================================
    echo.
    echo   คลิกขวาที่ไฟล์นี้
    echo   เลือก "Run as administrator"
    echo.
    pause
    exit
)

echo ========================================
echo   LTAX WebGIS - Auto Setup
echo ========================================
echo.
echo   [1/3] กำลังเปิด Firewall... [cite: 3]

:: เปิด Firewall (ถ้ายังไม่ได้เปิด) [cite: 3]
netsh advfirewall firewall show rule name="PHP Server Port 8000" >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name="PHP Server Port 8000" dir=in action=allow protocol=TCP localport=8000 >nul
    echo   ✅ เปิด Firewall สำเร็จ [cite: 3]
) else (
    echo   ✅ Firewall เปิดอยู่แล้ว [cite: 3]
)

echo.
echo   [2/3] กำลังหา IP Address... [cite: 4]

:: หา IP อัตโนมัติ [cite: 4]
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192.168"') do (
    set MYIP=%%a
)
if "%MYIP%"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set MYIP=%%a
        goto :found
    )
)
:found
set MYIP=%MYIP: =%
echo   ✅ IP Address: %MYIP% [cite: 4]

echo.
echo ========================================
echo   [3/3] กำลังเริ่มเซิร์ฟเวอร์... [cite: 5]
echo ========================================
echo.
echo   📱 iPhone/มือถือ: http://%MYIP%:8000 [cite: 5]
echo   💻 เครื่องนี้:     http://localhost:8000 [cite: 5]
echo.
echo ========================================
echo   กด Ctrl+C เพื่อหยุด [cite: 6]
echo ========================================
echo.

:: รัน PHP Server [cite: 6]
php -S 0.0.0.0:8000
pause