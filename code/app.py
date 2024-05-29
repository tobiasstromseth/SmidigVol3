import webview
import os
import tkinter as tk
from tkinter import filedialog
from Vol3Functions import *

class Api:
    def __init__(self):
        self.file_path = None

    def openFileDialog(self):
        root = tk.Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename()
        self.setFilePath(file_path)
        return file_path


    def setFilePath(self, file_path):
        self.file_path = file_path
        print(f'File path set: {self.file_path}')
        identify_os(self.file_path)

    def moveFileToFolder(self):
        if self.file_path is None:
            print('No file path set')
            return

        # Definer målmappen
        folder_path = 'code/memDump/'
        
        # Sjekk om målmappen eksisterer, hvis ikke, opprett den
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        # Hent filnavnet fra filbanen
        file_name = os.path.basename(self.file_path)
        
        # Flytt filen til målmappen
        destination_path = os.path.join(folder_path, file_name)
        os.rename(self.file_path, destination_path)
        
        print(f'File {file_name} moved to {destination_path}')

    def run_plugin(self, plugin_name):
        print(f'Running plugin: {plugin_name}')
        # Perform plugin-specific actions based on the plugin name
        output = run_command_from_gui(plugin_name)

        print("done running plugin")
        return output
    
    def debug(self, message):
        print(f'Debug: {message}')


api = Api()
webview.create_window('Enkel GUI', url='index.html', js_api=api)
webview.start()
