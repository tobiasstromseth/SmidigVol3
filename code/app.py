import webview
import os
import tkinter as tk
from tkinter import filedialog
from Vol3Functions import *
import queue

output_queue = queue.Queue()


    

class Api:
    def __init__(self):
        self.file_path = None
        self.detected_os = None

    def openFileDialog(self):
        root = tk.Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename()
        detected_os = self.setFilePath(file_path)
        return file_path, detected_os
    
    def log(self):
            #with open("output.txt", "r") as file:
                #value = file.read()
            value = "Hello World"
            # Print to terminal
            print(value)
            # Capture the printed output
            output_queue.put(value)
            return value

    def setFilePath(self, file_path):
        self.file_path = file_path
        print(f'File path set: {self.file_path}')
        detected_os = identify_os(self.file_path)
        return detected_os

    def moveFileToFolder(self):
        if self.file_path is None:
            print('No file path set')
            return

        # Define the target folder
        folder_path = 'code/memDump/'
        
        # Check if the target folder exists, if not, create it
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        # Get the file name from the file path
        file_name = os.path.basename(self.file_path)
        
        # Move the file to the target folder
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
    
    def minimize(self):
        webview.windows[0].minimize()

    def toggle_fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def close(self):
        webview.windows[0].destroy()
    
    def resize_window(self, width, height):
        webview.windows[0].resize(width, height)

    def log(self):
        #with open("output.txt", "r") as file:
            #value = file.read()
        value = "Hello World"
        # Print to terminal
        print(value)
        # Capture the printed output
        output_queue.put(value)
        return value
    

def main():
    api = Api()
    webview.create_window('Drumlin', url='index.html', js_api=api, 
                        width=1920, height=1080,  
                        background_color='#000000',
                        easy_drag=True,
                        text_select=True,
                        frameless=True,
                        resizable=True)


    webview.start()

if __name__ == "__main__":
    main()
