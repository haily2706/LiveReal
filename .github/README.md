# SDLC Workflow Apply Guide



1. Run sdlc.setup-workflow commands it will help you scan the repo and setup the workflow following the project context



# Lookup SLACK\_MCP\_XOXC\_TOKEN

1. Open Slack Web App and Press F12 to open your browser's Developer Console.
2. In Firefox, under Tools -> Browser Tools -> Web Developer tools in the menu bar
3. In Chrome, click the "three dots" button to the right of the URL Bar, then select More Tools -> Developer Tools
4. Switch to the console tab.
5. Type "allow pasting" and press ENTER.
6. Paste the following snippet and press ENTER to execute: JSON.parse(localStorage.localConfig\_v2).teams\[document.location.pathname.match(/^/client/(\[A-Z0-9]+)/)\[1]].token
