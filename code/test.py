import webview

first_window = webview.create_window('Woah dude!', 'https://pywebview.flowrl.com')
second_window = webview.create_window('Second window', 'https://woot.fi')
webview.start()