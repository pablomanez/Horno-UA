//BOTONES DEL HORNO
b_resS = false;
b_resI = false;
b_grill = false;
b_fan = false;



//INDICADORES
function resS(){
	let img = document.querySelector('#resS');

	!b_resS? 	img.setAttribute('src','iconos/nuevos/superior2.png') : 
				img.setAttribute('src','iconos/nuevos/superior1.png') ;

	!b_resS? b_resS = true : b_resS = false;
}

function resI(){
	let img = document.querySelector('#resI');

	!b_resI? 	img.setAttribute('src','iconos/nuevos/inferior2.png') : 
				img.setAttribute('src','iconos/nuevos/inferior1.png') ;

	!b_resI? b_resI = true : b_resI = false;
}

function grill(){
	let img = document.querySelector('#grill');

	!b_grill? 	img.setAttribute('src','iconos/nuevos/grill2.png') : 
				img.setAttribute('src','iconos/nuevos/grill1.png') ;

	!b_grill? b_grill = true : b_grill = false;	
}

function fan(){
	let img = document.querySelector('#fan');

	!b_fan? 	img.setAttribute('src','iconos/nuevos/fan2.png') : 
				img.setAttribute('src','iconos/nuevos/fan1.png') ;

	!b_fan? b_fan = true : b_fan = false;	
}

//TEMPERATURA
function tempMenos(num){
	let input = document.querySelector('#inputTemp');
	let range = 0;

	num? range = 5 : range = 1;

	input.value -= range;

	if(input.value < 0) input.value = 0;
}

function tempMas(num){
	let input = document.querySelector('#inputTemp');
	let range = 0;

	num? range = 5 : range = 1;

	input.value -= -(range);

	if(input.value > 270) input.value = 270;	
}

//TIEMPO
function timeMenos(num){
	let input = document.querySelector('#inputTime');
	let range = 0;

	num? range = 5 : range = 1;

	input.value -= range;

	if(input.value < 0) input.value = 0;
}

function timeMas(num){
	let input = document.querySelector('#inputTime');
	let range = 0;

	num? range = 5 : range = 1;

	input.value -= -(range);

	if(input.value > 270) input.value = 270;	
}

function updateTemp(){
	console.log("se ha cambiado la temperatura wey");
}

function updateTime(){

}