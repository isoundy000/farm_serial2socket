var SerialPort = require('serialport')
var net = require('net')

const conf = {
    DELAY_TIME: 5000, //遍历时间
    BAUD: 38400,
    HOST: 'localhost',
    PORT: 2013
}


var lockList = []
var serialSocket = {}

function handlerSocket(comName, port) {
    var client = new net.Socket()

    serialSocket[comName] = client

    client.connect(conf.PORT, conf.HOST, function () {
        // console.log('socket connected: ' + conf.HOST + ':' + conf.PORT);
    });

    client.on('data', function (data) {
        port.write(data)
        console.log('serial <<== socket: ', comName, data)
    });

    client.on('error', function (err) {
        console.log('client error: ', comName, err.message)
        port.close()
    });

    client.on('close', function () {
        port.close()
        console.log('socket closed');
    });

}


function handlerSerial(comName) {
    var port = new SerialPort(comName, {
        baudRate: conf.BAUD,
        lock: false
    })

    handlerSocket(comName, port)
    lockList.push(comName)

    port.on('open', function () {
        // console.log('port open: ', comName)
    })
    port.on('data', function (data) {
        serialSocket[comName].write(data)
        console.log('serial ==>> socket: ', comName, data)
    })
    port.on('error', function (err) {
        // do nothing/
        console.log('port error: ', comName, err.message)
    })
    port.on('close', function () {
        var index = lockList.indexOf(comName)
        lockList.splice(index, 1)
        console.log('port close: ', comName)
    })
}

function handler() {
    SerialPort.list(function (err, ports) {
        ports.forEach(function (port) {
            var index = lockList.indexOf(port.comName)
            if (index === -1) {
                handlerSerial(port.comName)
            }
        })
    })
}


setInterval(handler, conf.DELAY_TIME)

