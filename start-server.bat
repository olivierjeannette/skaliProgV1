@echo off
title Skali Prog - Serveur Local
color 0A
cls

echo =====================================
echo   SKALI PROG - SERVEUR LOCAL
echo =====================================
echo.
echo Demarrage du serveur http-server...
echo.
echo Le serveur sera accessible sur :
echo   - http://127.0.0.1:8080
echo   - http://localhost:8080
echo.
echo Appuyez sur CTRL+C pour arreter le serveur
echo =====================================
echo.

REM Lancer le serveur http-server
REM -p 8080 : port 8080
REM -c-1 : pas de cache (important pour le developpement)
REM --cors : active CORS pour les requetes API
http-server -p 8080 -c-1 --cors

pause
