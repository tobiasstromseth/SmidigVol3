import subprocess
import os

# Tving Python til å bruke UTF-8 for all tekstbehandling
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"


def run_volatility():
    command = [
        'python', 'code\\Volatility3\\vol.py',
        '-f', 'F:\\skole\\vol3guio\\memoryDumps\\Challenge.raw',
        'windows.psscan.PsScan'
    ]

    # Kjør kommandoen og håndter tegn som ikke kan kodes
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors='replace')

    output, errors = process.communicate()

    if errors:
        print("Feil oppstått:", errors)

    # Skriv utdata til en fil med UTF-8 koding, og bruk 'replace' for å håndtere ikke-kodable tegn
    with open('output.txt', 'w', encoding='utf-8', errors='replace') as file:
        file.write(output)

    print("Volatility3 har kjørt ferdig, og utdata er lagret i 'output.txt'.")

run_volatility()
