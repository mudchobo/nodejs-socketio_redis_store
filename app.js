var redisInfo = {
    host: '192.168.56.1',
    port: 6379
};
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    RedisStore = require('socket.io/lib/stores/redis'),
    redis = require('socket.io/node_modules/redis'),
    pub = redis.createClient(redisInfo.port, redisInfo.host),
    sub = redis.createClient(redisInfo.port, redisInfo.host),
    client = redis.createClient(redisInfo.port, redisInfo.host);

if (process.argv.length < 3){
    console.log('ex) node app <port>');
    process.exit(1);
}
app.listen(process.argv[2]);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            data = data.toString('utf-8').replace('<%=host%>', req.headers.host);
            res.end(data);
        });
}

io.configure(function(){
    io.set('store', new RedisStore({
        redisPub: pub,
        redisSub : sub,
        redisClient : client
    }));
});

io.sockets.on('connection', function (socket) {
    socket.on('message', function(data){
        socket.broadcast.emit('message', data);
    });
});
