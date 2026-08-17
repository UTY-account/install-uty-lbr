@echo off
chcp 65001 >nul
title PRO-INSTALL - ระบบอัปเดตโค้ดขึ้น GitHub และ Cloudflare
color 0B

echo ======================================================================
echo          🚀 PRO-INSTALL - ระบบอัปเดตโค้ดขึ้น GitHub ^& Cloudflare
echo ======================================================================
echo.
echo  กำลังเตรียมการส่งข้อมูลขึ้น GitHub (UTY-account/install-uty-lbr)...
echo.

cd /d "%~dp0"

echo [1/3] ตรวจสอบไฟล์ที่มีการแก้ไข...
git status -s
echo.

set /p msg="ระบุข้อความอธิบายการแก้ไข (หรือกด Enter เพื่อใช้ข้อความอัตโนมัติ): "
if "%msg%"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set msg=Update system at %date% %time%
)

echo.
echo [2/3] กำลังบันทึกการเปลี่ยนแปลง: "%msg%"
git add .
git commit -m "%msg%"
echo.

echo [3/3] กำลังส่งขึ้น GitHub (git push origin main)...
git push origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo  ✅ สำเร็จ 100%%! โค้ดถูกส่งขึ้น GitHub เรียบร้อยแล้ว
    echo  ☁️  Cloudflare กำลังทำการอัปเดตหน้าเว็บให้อัตโนมัติใน 1 นาที
    echo.
    echo  🌐 ตรวจสอบเว็บจริงได้ที่: https://install-uty-lbr.utthayan.workers.dev
    echo ======================================================================
) else (
    color 0C
    echo.
    echo ======================================================================
    echo  ❌ เกิดข้อผิดพลาดในการอัปโหลด กรุณาตรวจสอบอินเทอร์เน็ตหรือสิทธิ์ GitHub
    echo ======================================================================
)

echo.
echo กดปุ่มใดก็ได้เพื่อปิดหน้าต่างนี้...
pause >nul
