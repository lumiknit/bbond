# BBOND - Quick bond your string from web

BBOND is a Chrome extension which quickly bonds
your selection from webpage to Markdown or HTML format.

## Features

- Open popup / sidepanel and start recording.
- When you trigger 'copy' (e.g. `Ctrl + C` or context menu), the extension try to parse the selection and join to the buffer.
- Open popup / sidepanel again and use the buffer!

### How content is parsed?

- Basically, this extension do not look your clipboard content, but try to extract the selection range from the webpage.
- It takes the DOM nodes and try to parse into Markdown if need.

### Data and Privacy

- This extension do not read your clipboard content.
- This extension may read the content of the webpage only when you trigger 'copy' event.
- Only your selection content is parsed and stored during recording.
- The parsed content may be stored in your local storage.
- It does not use any network.
