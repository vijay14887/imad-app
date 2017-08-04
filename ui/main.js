console.log('Loaded!');

var element = document.getElementById('maincontent');
element.innerHTML = "New para";

var img = document.getElementById('img');
img.onclick = function()
{
    img.style.marginLeft = '100px';
};