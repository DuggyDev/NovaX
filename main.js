const { app, BrowserWindow } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 750, minWidth: 800, minHeight: 500,
    backgroundColor: '#0b0720',
    icon: path.join(__dirname, 'src', 'logo.png'),
    autoHideMenuBar: true,
    title: 'NovaX'
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
