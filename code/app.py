import webview

import os

def run_volatility():
    # Naviger til mappen der Volatility er installert
    volatility_dir = r"code\Volatility3"
    os.chdir(volatility_dir)
    
    # Kjør Volatility-kommandoen
    os.system("python vol.py")

# Kall funksjonen for å kjøre Volatility
run_volatility()


class Api:
    def printMessage(self, message):
        print(message)

webview.create_window('Enkel GUI', url='index.html', js_api=Api())
webview.start()
