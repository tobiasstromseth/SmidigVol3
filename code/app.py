import webview
import queue

output_queue = queue.Queue()

class Api:
    def printMessage(self, message):
        print(message)

    def log(self):
        with open("output.txt", "r") as file:
            value = file.read()
        # Print to terminal
        print(value)
        # Capture the printed output
        output_queue.put(value)
        return value

webview.create_window('Enkel GUI', url='index.html', js_api=Api())
webview.start()
