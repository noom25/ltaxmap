@echo off
title LTAX PHP Starter - Core System
cd /d %~dp0

:: บอกทางไป PHP (Path)
SET "PATH=%PATH%;D:\test\php"

echo ========================================
echo   LTAX WebGIS - PHP Core (D:\test\php)
echo ========================================

:: 1. สั่งปิด PHP ที่อาจค้างอยู่ก่อน
taskkill /f /im php.exe >nul 2>&1

:: 2. เช็คว่าเจอ PHP จริงไหม
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ERROR: ไม่พบไฟล์ PHP ใน D:\test\php
    echo กรุณาเช็คว่ามีไฟล์ php.exe อยู่ในโฟลเดอร์ดังกล่าวหรือไม่
    pause
    exit
)

echo [OK] พบ PHP พร้อมทำงาน...
echo กำลังเริ่ม Server ที่ http://localhost:8000

:: 3. รัน PHP Server
php -S 0.0.0.0:8000