@echo off
setlocal
set "PATH=C:\Users\Reeshan\AppData\Local\Programs\Git\cmd;%PATH%"

echo ======================================================================
echo  Star Digital Affiliate Marketing - GitHub Deploy Tool
echo ======================================================================
echo.
echo Connecting to:
echo https://github.com/reeshanstardigitalsolutions-web/Creator-Seeding-Onboarding-Target-Tracker-SDS.git
echo.
echo Pushing branch 'main' to GitHub...
echo (If prompted, sign in via your browser or paste your GitHub Token)
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  SUCCESS! Successfully pushed to GitHub repository!
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo  Push encountered an issue. Please verify your GitHub login above.
    echo ======================================================================
)

echo.
pause
