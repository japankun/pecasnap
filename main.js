// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray } = require('electron');
const express = require("express");
const childProcess = require('child_process');
const fs = require('fs');
const bodyParser = require('body-parser');

let ffmpeg = require('ffmpeg-static-electron');
const Store = require('electron-store');
const store = new Store();

if (!store.get('peercast.IP'))
  store.set('peercast.IP', '127.0.0.1');

if (!store.get('peercast.Port'))
  store.set('peercast.Port', '7144');

if (!store.get('pecasnap.Port'))
  store.set('pecasnap.Port', '37144');

let exapp = express();
exapp.use(express.static("public"));
exapp.use(bodyParser.urlencoded({ extended: true }))
exapp.listen(store.get('pecasnap.Port'), "127.0.0.1");
const filetype = '.webp';

exapp.post('/config', function (req, res) {

  store.set('peercast.IP', req.body.peercastIP);
  store.set('peercast.Port', req.body.peercastPort);  

  res.send("200");

});

exapp.get('/config', function (req, res) {

  let send = {
    'peercastIP': store.get('peercast.IP'),
    'peercastPort': store.get('peercast.Port')
  }

  res.send(send);

});

exapp.get('/capture/:streamID', function (req, res) {

  let now = Date.now();
  let ffmpegOptions = [
    "-i",
    "http://" + store.get('peercast.IP') + ":" + store.get('peercast.Port') + "/stream/" + req.params.streamID,
    "-y",
    "-vf",
    "select=\'eq(pict_type\,PICT_TYPE_I)\'",
    "-vsync",
    "vfr",
    "-vframes",
    "1",
    "./snapshot/" + now + "_" + req.params.streamID + filetype
  ];

  let snapProc = childProcess.spawn(ffmpeg.path, ffmpegOptions);

  snapProc.on('close', function (code) {

    if (fs.existsSync("./snapshot/" + now + "_" + req.params.streamID + filetype)) {
      fs.copyFileSync(ffmpegOptions.pop(), "./snapshot/" + req.params.streamID + filetype);
    }

  });

  res.send(req.params.streamID);

});

exapp.get('/album/:streamID', function (req, res) {

  let files = fs.readdirSync("./snapshot").sort();
  files.reverse();

  /*
  let files = fs.readdirSync("./snapshot").sort(function (a, b) {
    return (a < b ? 1 : -1);
  });
  */

  if (req.params.streamID != 'all') {

    let retlist = [];

    for (var filename of files ) {

      if (1 < filename.indexOf(req.params.streamID)) {
        retlist.push(filename);
      }

    }

    res.send(retlist);

  } else {

    let retlist = [];

    for (var filename of files ) {

      if (0 != filename.indexOf('.')) {
        retlist.push(filename);
      }

    }

    res.send(retlist);

  }

  files = files.slice(0, 50);
  res.send(files);

});

exapp.get('/snapshot/:file', function (req, res) {

  if (fs.existsSync("./snapshot/" + req.params.file)) {
    let buf = fs.readFileSync("./snapshot/" + req.params.file);
    res.send(buf, { 'Content-Type': 'image/webp' }, 200);
  } else {
    res.send("");
  }

});

exapp.get('/live/:streamID', function (req, res) {

  if (fs.existsSync("./snapshot/" + req.params.streamID + filetype)) {
    res.send("./snapshot/" + req.params.streamID + filetype);
  } else {
    res.send("");
  }

});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  //mainWindow = new BrowserWindow({width: 800, height: 800, titleBarStyle: 'hidden', autoHideMenuBar: true });
  mainWindow = new BrowserWindow({width: 800, height: 800, titleBarStyle: 'hidden'})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  })

}

let tray = null
app.on('ready', function () {
  tray = new Tray('icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {label: '開く', click (menuItem) {
      mainWindow.show();
    }},
    {label: '終了', click (menuItem) {
      app.quit();
    }}
  ])
  tray.setToolTip('PecaSnap');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', function () {
    mainWindow.show();
  }) 

})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
