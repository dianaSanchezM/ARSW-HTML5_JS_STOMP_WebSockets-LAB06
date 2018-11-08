var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var dibujo=0;

    var addPointToCanvas = function (point) {   
        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        //var topic = document.getElementById("identificador").value;
        
    };
    
    var addPolygonToCanvas = function (points) {   
        
        var c2 = canvas.getContext('2d');
        c2.fillStyle = '#f00';
        c2.beginPath();
        c2.moveTo(points[0].x,points[0].y);
        c2.lineTo(points[1].x,points[1].y);
        c2.lineTo(points[2].x,points[2].y);
        c2.lineTo(points[3].x,points[3].y);
        c2.closePath();
        c2.fill();
        
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (topic) {
        
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            
            stompClient.subscribe('/topic/newpoint'+topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                //alert("Nuevo punto: "+theObject.x+" "+theObject.y);
                addPointToCanvas(new Point(theObject.x,theObject.y));
            });
            stompClient.subscribe('/topic/newpolygon'+topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                alert("Nuevo polygon: "+theObject[3].x+" "+theObject[3].y);
                addPolygonToCanvas(theObject);
            });
        });

    };
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            connectAndSubscribe('');
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            var topic = document.getElementById("identificador").value;
            console.info("publishing point at "+topic);
            addPointToCanvas(pt); 
            //publicar el evento
        },
        
        connectSpecificTopic: function (){
            var can = document.getElementById("canvas");
            can.width=window.innerWidth;
            can.height=window.innerHeight;
            dibujo= document.getElementById("identificador").value;
            connectAndSubscribe("."+dibujo);
            canvas.addEventListener('click',function(evt){
                var pos = getMousePosition(evt);
                //addPointToCanvas(pos);
                stompClient.send("/app/newpoint."+dibujo, {}, JSON.stringify(pos)); 
                
            },false);
            //websocket connectionvar topic = document.getElementById("identificador").value;
            
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();