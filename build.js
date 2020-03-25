const path = require('path');
var fs = require('fs');
const now = new Date()
const secondsSinceEpoch = Math.round(now.getTime() / 1000)


const CSS = [];
const JS = [
    'jquery/dist/jquery.min.js',
    'jssip/dist/jssip.min.js',
    'recordrtc/RecordRTC.min.js'
];

const Assets = [...JS, ...CSS];

function buildAssets() {
    if (!fs.existsSync('./public/assets')) {
        fs.mkdirSync('./public/assets');
    }
    if (!fs.existsSync('./public/assets/css')) {
        fs.mkdirSync('./public/assets/css');
    }
    if (!fs.existsSync('./public/assets/js')) {
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
}
function execCommand(cmd, wdir) {
    console.log('executing  ' + cmd + ' ...');
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: wdir }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                process.exit(99);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function go() {
    console.log('\n*** NOTE: make sure gulp is already installed (as root, npm install -g gulp-cli). ***\n');

    s = await execCommand('rm -rf node_modules >/dev/null  # removing node_modules', '.');

    s = await execCommand('npm install >/dev/null  # main install', '.');

    s = await execCommand('npm install >/dev/null  # jssip install', './node_modules/jssip');

    s = await execCommand('gulp dist >/dev/null  # jssip build', './node_modules/jssip');

    s = await execCommand('rm -f public/assets/css/* public/assets/fonts/* public/assets/js/* public/assets/webfonts/* || true > /dev/null 2>&1 ', '.');

    //PATCH jssip.js per our findings, rename to jssip.min.js, let build proceed from there
    tempFile = '/tmp/ed' + secondsSinceEpoch + '.txt';
    s = await execCommand('head -n 18197 node_modules/jssip/dist/jssip.js > ' + tempFile + '  # modifying jssip', '.');

    s = await execCommand('cat patches/jssip_patch.txt >> ' + tempFile, '.');

    s = await execCommand('tail -n 8168 node_modules/jssip/dist/jssip.js >> ' + tempFile, '.');

    s = await execCommand('mv ' + tempFile + ' node_modules/jssip/dist/jssip.min.js  ', '.');

    buildAssets();

    console.log('Done.\n');
}

go(); //MAIN
