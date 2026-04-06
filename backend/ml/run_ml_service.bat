@echo off
echo Starting Miraa Price Prediction ML Service...
cd /d %~dp0
python miraa_predictor.py
pause