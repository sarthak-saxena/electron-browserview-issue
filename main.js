const { app, BrowserWindow, BrowserView } = require("electron");
const path = require("path");

let mainWindow = null;
let wc = null;

// uncomment  this to open devtools to all webcontents (windows, child windows, webview,
// note that in current Electron version, this will not work for iframe)
app.on("web-contents-created", (e, wc) => {
  // wc.openDevTools();
});

const openDevTools = () => {
  wc.openDevTools();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      webSecurity: false,
      sandbox: true,
      nativeWindowOpen: true,
      defaultEncoding: 'UTF-8',
      webviewTag: true
    }
  });

	mainWindow.loadFile("main.html");
  mainWindow.on("closed", () => (mainWindow = null));

  mainWindow.webContents.on('did-finish-load', () => {
  	const script = 'const element = document.getElementById("browserView");' +
			'const bounds = element.getBoundingClientRect();' +
			'JSON.stringify(bounds)'
		mainWindow.webContents.executeJavaScript(script).then((bounds) => {
			bounds = JSON.parse(bounds)
			const view = new BrowserView()
			mainWindow.addBrowserView(view)
			view.setBounds({
				x: Math.floor(bounds.x),
				y: Math.floor(bounds.y),
				width: Math.floor(bounds.width),
				height: 300
			})
			view.webContents.loadFile('browserView.html')
		})
	})

  mainWindow.webContents.on(
    "new-window",
    (e, url, frameName, disposition, options) => {

      e.preventDefault();

      const custom = {
        frame: false,
        webPreferences: {
          defaultEncoding: 'UTF-8'
        },
        webContents: options.webContents
      };

      const win = new BrowserWindow({ ...options, ...custom });
      e.newGuest = win;
    }
  );
};

app.on("ready", createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => mainWindow === null && createWindow());
