var button = document.getElementById('counter');

button.onclick = function() {
    
    // Create a request object
    var request = new XMLHttpRequest();
    
    //Capture the response and store it in a variable
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
        // take some action
        if(request.status === 200){
            var counter = request.responseText;
            var span = document.getElementById('count');
            span.innerHTML = counter.toString();
        }
        }
    };
    
    // Make the request
    request.open('GET','http://vijay14887.imad.hasura-app.io/counter',true);
    request.send(null);
    
};

var nameinput = document.getElementById('name').value;
var submit = document.getElementById('submit_btn');
submit.onclick = function() {
    // Make a request to the server and send the name
    
    // Capture the name list and render it as a list
    var names = ['name1','name2','name3','name4'];
    var list = '';
    for (var i =0; i <names.length; i++){
        list += '<li>' + names[i] + '</li>';
    }
    var ul = document.getElementById('namelist');
    ul.innerHTML = list;
};
/* console.log('Loaded!');

var element = document.getElementById('maincontent');
element.innerHTML = "New para";

var img = document.getElementById('img');

var marginLeft = 0 ;
function moveRight()
{
    marginLeft= marginLeft + 5;
    img.style.marginLeft = marginLeft + 'px';
}
img.onclick = function()
{
   var interval=setInterval(moveRight,50);
};*/
