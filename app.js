var app = require('express')();
var server = require('http').createServer(app);
var http = require('http');
var io = require('socket.io').listen(server);

var jsdom = require('jsdom');
var window = jsdom.jsdom().createWindow();
var $ = require('jquery')(window);

var node_list = [
	{
		options: {
			host: "www.google.com",
			port: 80,
			path: '/'
		}, //don't know if this make sense...could not ping just use url..
		name: "robots",
		expected_value: "noodp"
	},
	{
		options:{
			host: "www.airgallery.org",
			port: 80,
			path: '/'
		},
		name: "verify-v1",
		expected_value: "dd64gmRJJKfR8DdB5gpf6ZlVX75ZuC7lgAqQ14yggaQ="
	},
	{
		options:{
			host: "www.hulu.com",
			port: 80,
			path: '/'
		},
		name:"application-name",
		expected_value:"Hulu"
	}
]

var status_list = [
	// {
		// url: "",
		// history:[
			// {
				// time: 111,
				// status: 1 //0 or 1
			// }
		// ]
	// },
	// {
	
	// }
]
server.listen(3000, function(){
	console.log('Listening on port1111 %d', server.address().port);
});

app.get('/', function(req, res){
res.sendfile(__dirname+'/index.html');
});

//when page is loaded, show info too

io.sockets.on('connection', function (socket) {
  curl(socket);
  
	setInterval(function () {
		curl(socket);
		console.log("node_list.length: "+node_list.length);
  }, 1000*100);
});

var index = 0;
function curl(socket){
  console.log("index: " + index);
	var result = {};
	var name = getName(index);
	var options = getUrl(index);
	var targetVal = "";	
	var html = "";	
	var resTime;
	
	var startTime= new Date().getTime();
	http.get(options, function(res){
		res.on('data', function(data){
			html += data;
		}).on('end', function(e){
			resTime = new Date().getTime()-startTime;

			console.log("resTime" + resTime);
			
			targetVal = $(html).find('meta[name='+name+']').attr('content');
			
			result.time = resTime;
			
			if(targetVal == 'undefined')
			{
				result.status = 0;
				return result;
			}

			console.log('targetVal: '+targetVal);			
			console.log(targetVal + '=?' + getExpectedVal(index));
			
			if(targetVal == getExpectedVal(index))
				result.status = 1;
			else
				result.status = 0;
				
			save(index, result);
		
			//curl next item
			index++;
		
			if(index == node_list.length)
			{
				console.log('Send Status.....');
				socket.emit('serverStatus',status_list);
				index = 0;
			}
			
			if(index < node_list.length)
			{
				
				curl(socket);
			}
			
		})
	});
}

//record contains time and status
function save(index, history){
	var obj = status_list[index];
	if(obj == null)
	{
		obj = {};
		obj.url = getUrl(index);
		obj.history = [];
		obj.history.push(history);
		status_list[index] = obj;
	}
	else
	{
		var histories = obj["history"];
		histories.push(history);
	}
}

function getUrl(index){
	return node_list[index].options;
}

function getName(index){
	return node_list[index].name;
}

function getExpectedVal(index){
	return node_list[index].expected_value;
}


