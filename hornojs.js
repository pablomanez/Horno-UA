//BOTONES DEL HORNO
b_resS = false;
b_resI = false;
b_grill = false;
b_fan = false;
b_puerta = false;

//PARA EL ajustar()
bar_tiempo = 0;
bar_temperatura = 0;

//EL TIEMPO MAXIMO SE MARCA COMO LA BARRA RELLENA DE TIEMPO
TIME_MAX = 0;


//INDICADORES (TODAS LLAMAN A ajustar())
function resS(){
	let img = document.querySelector('#resS');

	!b_resS? 	img.setAttribute('src','iconos/nuevos/superior2.png') : 
				img.setAttribute('src','iconos/nuevos/superior1.png') ;

	!b_resS? b_resS = true : b_resS = false;

	ajustar();
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

	//ES QUIEN LLAMA A AJUSTAR
function updateTemp(){
	let valor = document.querySelector('#inputTemp').innerText;
	let progress = document.querySelector('#progressTemp');

	bar_temperatura = valor;

	valor_aux = valor/2.7;

	progress.setAttribute('style','width: '+valor_aux+'%;');
	progress.setAttribute('aria-valuenow',valor_aux);
	progress.innerText = valor+'ºC';

	ajustar();
}

//TIEMPO
function timeMenos(num){
	let tiempo = document.querySelector('#inputTime');
	let tiempo_aux = tiempo.innerText.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];
	let segundos = tiempo_aux[2];

	let range = 0;

	num? range = 10 : range = 5;

	if(minutos>0)
		minutos -= range;

	if(minutos<0 && hora>0){
		minutos += 60;
		
		hora -= 1;
		if(hora<10)		hora = '0'+hora;
	}
	
	let min_aux = minutos+'';
	if(minutos<10 && minutos>=0 && min_aux.length!=2)	minutos = '0'+minutos;

	let update = hora+':'+minutos+':'+segundos;

	tiempo.innerText = update;

	updateTime();
}

function timeMas(num){
	let tiempo = document.querySelector('#inputTime');
	let tiempo_aux = tiempo.innerText.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];
	let segundos = tiempo_aux[2];

	let range = 0;

	num? range = 10 : range = 5;

	minutos -= -(range);

	if(minutos>=60){
		minutos -= 60;
		
		hora -= (-1);
		if(hora<10)		hora = '0'+hora;
	}
	
	if(minutos<10)	minutos = '0'+minutos;

	let update = hora+':'+minutos+':'+segundos;

	tiempo.innerText = update;

	updateTime();
}
	
	//ES QUIEN LLAMA A AJUSTAR
function updateTime(){
	let tiempo = document.querySelector('#inputTime').innerText;
	let tiempo_aux = tiempo.split(':');

	let hora = tiempo_aux[0];
	let minutos = tiempo_aux[1];
	let segundos = tiempo_aux[2];
	
	let total = minutos-(-hora*60)-(-segundos/60);
	
	bar_tiempo = total;
	//console.log(bar_tiempo);
	TIME_MAX = total;

	updateTimeBar();
	ajustar();
}

function updateTimeBar(){
	bar_tiempo /= (TIME_MAX)/100;

	let progress = document.querySelector('#progressTime');

	progress.setAttribute('style','width: '+bar_tiempo+'%;');
	progress.setAttribute('aria-valuenow',bar_tiempo);
}

//PUERTA
var sto = null;
function indPuerta(estado){
	//console.log('Puerta abierta: '+estado);

	b_puerta = estado;

	let puerta = document.querySelector('#lock_puerta');

	b_puerta? 
		puerta.setAttribute("class","fas fa-lock-open fa-5x text-warning py-2") 
		: 
		puerta.setAttribute("class","fas fa-lock fa-5x text-warning py-2");

	ajustar();

	if (estado && !sto) {
		sto = setTimeout(function () { electro.pitido(true); }, 5000);
	} else {
		if (sto) {
			clearTimeout(sto);
			sto = null;
		}
		electro.pitido(false);
	}
}
electro.puerta(indPuerta);

//HORA
function indHoraActual(hora){
	let d_hora = document.querySelector('#hora');
	let d_dia = document.querySelector('#dia');

	let dia = hora.getDate();
		if(dia<10)	dia = '0'+dia;
	let mes = hora.getMonth()+1;
		if(mes<10)	mes = '0'+mes;
	let anyo = hora.getFullYear()+'';
		anyo = anyo.substr(2,2);
	
	d_hora.innerText = hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds();
	d_dia.innerText = dia+'/'+mes+'/'+anyo;

	if(bar_tiempo>0){
		let tiempo = document.querySelector('#inputTime');
		let tiempo_aux = tiempo.innerText.split(':');

		let hora = tiempo_aux[0];
		let min = tiempo_aux[1];
		let seg = tiempo_aux[2];

		if(seg>=0){
			seg = seg-1;
			if(seg<0){
				seg = 59;
				if(min>=0){
					min -=1;
					if(min<0){
						min = 59;
						if(hora>0)	hora -= 1;
					}
				}
			}
		}

		bar_tiempo = Math.abs(-(hora*60)-min-(seg/60));
		updateTimeBar();

		if(hora<10 && (hora+'').length!=2)		hora = '0'+hora;
		if(min<10 && (min+'').length!=2)		min = '0'+min;
		if(seg<10 && (seg+'').length!=2)		seg = '0'+seg;

		tiempo.innerText = hora+':'+min+':'+seg;
	}

	ajustar();
}
electro.hora(indHoraActual);

//TEMPERATURA EXTERIOR
function indTempExt(temp){
	document.querySelector('#tempExt').innerText = temp+' ºC';
}
electro.tempExterior(indTempExt);

//TEMPERATURA INTERIOR
function indTemInt (temp) {
	document.querySelector('#tempInt').innerText = temp.toFixed()+' ºC';
	ajustar();
}
electro.tempInterior(indTemInt);

//CONSUMO
function indConsumo(w){
	let consumo = document.querySelector('#consumo');

	consumo.innerText = w+' W';

	w>10? consumo.setAttribute('class','col-sm-6 col-md-12 text-lg text-danger font-weight-bold') : consumo.setAttribute('class','col-sm-6 col-md-12 text-lg');
}
electro.consumo(indConsumo);


// Ajusta los parámetros en función de los sensores y de la configuración establecida
function ajustar () {
	var temp = electro.tempInterior() < bar_temperatura;
	var tiempo = bar_tiempo > 0;
	var encendido = temp && tiempo;
	electro.resistenciaSuperior(encendido && b_resS);
	electro.resistenciaInferior(encendido && b_resI);
	electro.gratinador(encendido && b_grill);
	electro.ventilador(tiempo && b_fan);
}