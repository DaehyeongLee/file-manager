const express = require('express');
const path = require('path');
const http = require('http');
const webpack = require('webpack');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const redis = require('redis');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Io = require('socket.io'); //Socket Io

const middlewares = require('./middlewares');

const initExpress = redisClient => {
	const app = express();
	const PORT = 3000;

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(
		session({
			key: 'app.sid',
			secret: 'session-secret',
			store: new redisStore({
				host: '127.0.0.1',
				port: 6379,
				client: redisClient,
				prefix: 'session:',
				db: 0
			}),
			resave: false,
			saveUninitialized: true,
			cookie: { path: '/', maxAge: 1800000 }
		})
	);
	app.use(express.static(path.resolve('./dist/client')));
	app.use(express.static(path.resolve('./statics')));
	app.use(express.static(path.resolve('./node_modules')));
	app.use('/', require('./routes/view'));
	app.use('/api', require('./routes/api'));
	app.use(middlewares.error.logging);
	app.use(middlewares.error.ajaxHandler);
	app.use(middlewares.error.handler);

	return require('http')
		.createServer(app)
		.listen(PORT, () => {
			console.log('Express server listening on port ' + PORT);
		});
};

const initRedis = () => redis.createClient();
const initMongo = async () => {
	await mongoose.connect('mongodb://localhost:27017/app', { useNewUrlParser: true });
};

const main = () => {
	initMongo().then(() => {
		const redisClient = initRedis();
		const server = initExpress(redisClient);
		
		// socketio 생성후 서버 인스턴스 사용
		const io = Io(server);

		// socketio 문법
		io.on('connection', socket => {
			socket.on('send message', (item) => {
				const msg = item.userFrom + ' : ' + item.message;
				console.log(msg);
				//Socket Io 이벤트 발생
				if(item.userTo =='All') socket.broadcast.emit('receive message', {userFrom: item.userFrom, message: item.message}); //나를 제외한 전체에게 메시지 보내기
				else {
					//귓속말 대상 상대에게만 메시지 보내기
					io.emit('receive message', {userFrom: item.userFrom, message: item.message});
				}				
			});
			socket.on('disconnect', function () {
				console.log('user disconnected: ', socket.id);
			});
		});
	});
};

main();