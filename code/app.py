import webview


class Api:
    def printMessage(self, message):
        print(message)

webview.create_window('Enkel GUI', url='index.html', js_api=Api())
webview.start()
