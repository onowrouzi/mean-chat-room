module.exports = function(io, mongo) {
	
	mongo.connect('mongodb://onowrouzi:therighs1@ds139645.mlab.com:39645/heroku_80bclfr8', function(err, db){
		
		if(err) throw err;
		
		var currentUsers = [];
		var connections = [];
		
		io.on('connection', function(socket){
			var messages = db.collection('messages');
			connections.push(socket);
			console.log('Connected: ' + connections.length + ' sockets connected');
			
			socket.on('get messages', function(){ 
				io.emit('clear messages');
				messages.find().each(function(err, msg){
					if (err) throw err;
					if (msg != null) {
						io.emit('receive messages', msg);
					}
				});
			});
			
			socket.on('disconnect', function(data){
				connections.splice(connections.indexOf(socket), 1);
				console.log('Disconnected: ' + connections.length + ' sockets connected');
			});
			
			socket.on('send message', function(data){
				messages.insert({user: data.username, message: data.message, time: data.time}, function(){
					console.log("Inserted message: " + data.username + " -> " + data.message + " at " + data.time)
				});
			});
			
			socket.on('enter user', function(data){
				if (currentUsers.indexOf(data) == -1) {
					currentUsers.push(data);
					console.log("ENTER USER: " + data);
				}
				io.emit('get users', currentUsers);
			});
			
			socket.on('log out', function(data){
				console.log(data.user);
				currentUsers.splice(currentUsers.indexOf(data.user),1);
				io.emit('get users', currentUsers);
			});

		});
		
	});
	
}