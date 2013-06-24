var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    RedisStore = require('socket.io/lib/stores/redis'),
    redis = require('socket.io/node_modules/redis'),
    pub = redis.createClient(6379, '172.16.171.136'),
    sub = redis.createClient(6379, '172.16.171.136'),
    client = redis.createClient(6379, '172.16.171.136');

app.listen(9000);

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
    var clients = io.sockets.clients();
    console.log(clients);
    var ids = [];
    for (var i = 0; i < clients.length; i++){
        ids.push(clients[i].id);
    }
    socket.emit('users', { clients: ids });
});
