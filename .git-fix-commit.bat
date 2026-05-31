@echo off
cd /d "c:\Users\User\Downloads\react-tailwind-forum-ui"
git reset --soft HEAD~1
if exist .git-commit-msg.txt del /f .git-commit-msg.txt
if exist .git-do-commit.bat del /f .git-do-commit.bat
if exist .git-recommit.bat del /f .git-recommit.bat
git add .
git commit -m "refactor(hero): remove Team section and add glass sphere decor" -m "Drop the Team block from the landing page and remove its nav link. Fill the Hero right column with floating glassmorphism spheres that use brand colors, subtle parallax, and a balanced two-column layout."
if exist .git-fix-commit.bat del /f .git-fix-commit.bat
exit /b %ERRORLEVEL%
