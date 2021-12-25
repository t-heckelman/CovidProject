function toggle_visibility(id){
    var e = document.getElementById(id);
		console.log("check1");

if(e.style.display == 'block')
    e.style.display = 'none';
		console.log("check2");
else
    e.style.display = 'block';
		console.log("check3");
}
