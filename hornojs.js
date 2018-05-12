const TIME_MAX = 1440		//TIEMPO MAXIMO = 1 DIA

//BOTONES DEL HORNO
b_resS = false;
b_resI = false;
b_grill = false;
b_fan = false;
b_puerta = false;



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
	let range = 0;

	num? range = 5 : range = 1;

	document.querySelector('#inputTemp').innerText -= range;

	if(document.querySelector('#inputTemp').innerText < 0) 
		document.querySelector('#inputTemp').innerText = 0;

	updateTemp();
}

function tempMas(num){
	let range = 0;

	num? range = 5 : range = 1;

	document.querySelector('#inputTemp').innerText -= (-range);

	if(document.querySelector('#inputTemp').innerText > 270) 
		document.querySelector('#inputTemp').innerText = 270;	

	updateTemp();
}

function updateTemp(){
	let valor = document.querySelector('#inputTemp').innerText;
	let progress = document.querySelector('#progressTemp');

	valor_aux = valor/2.7;

	progress.setAttribute('style','width: '+valor_aux+'%;');
	progress.setAttribute('aria-valuenow',valor_aux);
	progress.innerText = valor+'ºC';
}

//TIEMPO
function timeMenos(num){
	let tiempo = document.querySelector('#inputTime');
	let tiempo_aux = tiempo.innerText.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];

	let range = 0;

	num? range = 10 : range = 5;

	minutos -= range;

	if(minutos<0){
		minutos += 60;
		
		hora -= 1;
		if(hora<10)		hora = '0'+hora;
	}
	
	if(minutos<10)	minutos = '0'+minutos;

	let update = hora+':'+minutos;

	tiempo.innerText = update;

	updateTime();
}

function timeMas(num){
	let tiempo = document.querySelector('#inputTime');
	let tiempo_aux = tiempo.innerText.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];

	let range = 0;

	num? range = 10 : range = 5;

	minutos -= -(range);

	if(minutos>=60){
		minutos -= 60;
		
		hora -= (-1);
		if(hora<10)		hora = '0'+hora;
	}
	
	if(minutos<10)	minutos = '0'+minutos;

	let update = hora+':'+minutos;

	tiempo.innerText = update;

	updateTime();
}

function updateTime(){
	let tiempo = document.querySelector('#inputTime').innerText;
	let tiempo_aux = tiempo.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];
	
	let total = minutos-(-hora*60);
	total /= 14.4;

	/*
	console.log(hora);
	console.log(minutos);
	console.log(total);
	*/

	let progress = document.querySelector('#progressTime');

	progress.setAttribute('style','width: '+total+'%;');
	progress.setAttribute('aria-valuenow',total);
	//progress.innerText = ;
}

//PUERTA
function indPuerta(estado){
	console.log('Puerta abierta: '+estado);

	b_puerta = estado;

	let puerta = document.querySelector('#lock_puerta');
	
	b_puerta? 
		puerta.setAttribute("class","fas fa-lock-open fa-5x text-warning py-2 pl-2") 
		: 
		puerta.setAttribute("class","fas fa-lock fa-5x text-warning py-2");

}
electro.puerta(indPuerta);