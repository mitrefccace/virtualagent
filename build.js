const path = require('path');
var fs = require('fs');


const CSS = [];
const JS = [
    'jquery/dist/jquery.min.js',
    'jssip/dist/jssip.min.js',
    'recordrtc/RecordRTC.min.js'
];

const Assets = [...JS, ...CSS];

if (!fs.existsSync('./public/assets')){
    fs.mkdirSync('./public/assets');
}
if (!fs.existsSync('./public/assets/css')){
    fs.mkdirSync('./public/assets/css');
}
if (!fs.existsSync('./public/assets/js')){
    fs.mkdirSync('./public/assets/js');
}

JS.map(asset => {
    let filename = asset.substring(asset.lastIndexOf("/") + 1);
    let from = path.resolve(__dirname, `./node_modules/${asset}`)
    let to = path.resolve(__dirname, `./public/assets/js/${filename}`)
    if (fs.existsSync(from)) {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    } else {
        console.log(`${from} does not exist.\nUpdate the build.js script with the correct file paths.`)
        process.exit(1)
    }
});

CSS.map(asset => {
    let filename = asset.substring(asset.lastIndexOf("/") + 1);
    let from = path.resolve(__dirname, `./node_modules/${asset}`)
    let to = path.resolve(__dirname, `./public/assets/css/${filename}`)
    if (fs.existsSync(from)) {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    } else {
        console.log(`${from} does not exist.\nUpdate the build.js script with the correct file paths.`)
        process.exit(1)
    }
});