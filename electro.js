(function () {

	"use strict";

	// Opciones del servidor
	var hostname = "localhost";
	var port = 9000;

	// Objeto de acceso a las funciones del electrodomestico
	var electro = {};	

	var sensores = {
		tempExterior: 22,
		tempInterior: 22,
		puerta: false,
		hora: new Date(),
		consumo: 0
	};

	var parametros = {
		resistenciaSuperior: false,
		resistenciaInferior: false,
		gratinador: false,
		ventilador: false,
		pitido: false
	};

	// Manejadores para el cambio de valores	
	var manejadores = {};

	// Manejador general de cambio
	var cambio = null;

	// Gestión del cambio de un dato
	function cambiar (dato, valor, notificar) {
		if (notificar === undefined) notificar = true;

		if (sensores[dato] !== undefined) {
			if (sensores[dato] == valor) return;
			if (dato == "hora" && sensores.hora.getTime() == valor.getTime()) return;
			sensores[dato] = valor;
		} else if (parametros[dato] !== undefined) {
			if (parametros[dato] == valor) return;
			parametros[dato] = valor;
		} else {
			console.error("ELECTRO. Error: No se puede cambiar: " + dato);
			return;
		}
		
		//if (dato != "hora") console.log("ELECTRO: Cambiar:", dato, "valor:", valor);
		if (manejadores[dato]) (manejadores[dato])(valor);
		if (cambio &&  notificar) cambio(dato, valor);	
	};

	// Evolución de los sensores... Se invoca cada segundo
	function paso () {
		cambiar("hora", new Date());
		// Reajustes de consumo y temperatura
		var t = 0, c = 0;

		// Calcular el incremento consumo y la temperatura en función de los parametros
		if (parametros.resistenciaSuperior) { t += 0.5; c += 2; }
		if (parametros.resistenciaInferior) { t += 0.5; c += 2; }
		if (parametros.ventilador) { c += 1; }
		if (parametros.gratidador) { t += 0.25; c += 3; }

		// Ajustar la perdida de temperatura en función de si la puerta está abierta
		t += (sensores.puerta ? 0.05 : 0.01) * (sensores.tempExterior - sensores.tempInterior);

		// Actualizar consumo y temperatura
		if (c) cambiar("consumo", sensores.consumo + c);
		if (t) cambiar("tempInterior", sensores.tempInterior + t);
	}

	// Funciones de acceso para sensores: leer valor o establecer manejador
	for (var s in sensores) {
		(function (s) {
			electro[s] = function (v) {
				if (v === undefined) return sensores[s];
				if (typeof v === "function") {
					//console.log("ELECTRO: Establecido manejador para sensor:", s);
					manejadores[s] = v;
					v(sensores[s]);
					return sensores[s];
				}
				console.error("ELECTRO. Error: No se puede cambiar el valor de un sensor");
			};
		})(s);
	}

	// Funciones de acceso para parametros: leer valor, establecer valor o establecer manejador
	for (var p in parametros) {
		(function (p) {
			electro[p] = function (v) {
				if (v === undefined) return parametros[p]; // Leer
				if (typeof v === "function") { // Manejador
					//console.log("ELECTRO: Establecido manejador para parametro:", p);
					manejadores[p] = v;
					v(parametros[p]);
					return parametros[p];
				}
				// Cambiar valor
				cambiar(p, v);
				return v;
			};
		})(p);
	}

	if (typeof window === "undefined") {
		// Código del servidor...	

		// Servidor web
		var express = require('express');
		var app = express();
		app.use(express.static('.', { index: "index.html"}));
		app.listen(3000);

		var connections = []; // conexiones activas

		setInterval(paso, 1000);

		var WebSocketServer = require('websocket').server;
		var http = require('http');

		var server = http.createServer(function(request, response) {
			//console.log((new Date()) + ' Received request for ' + request.url);
			response.writeHead(404);
			response.end();
		});

		server.listen(port);

		var wsServer = new WebSocketServer({
			httpServer: server,
			autoAcceptConnections: false
		});

		wsServer.on('request', function(request) {
			var connection = request.accept('electro', request.origin);
			connections.push(connection);
			//console.log((new Date()) + ' Connection accepted.');

			var f;
			for (f in sensores) connection.sendUTF(JSON.stringify({ dato: f, valor: sensores[f] }));
			for (f in parametros) connection.sendUTF(JSON.stringify({ dato: f, valor: parametros[f] }));

			connection.on('message', function(message) {
				//console.log('Received Message: ' + message.utf8Data);
				var msg = JSON.parse(message.utf8Data);
				//console.log("cambio desde fuera:", msg.dato, msg.valor);
				cambiar(msg.dato, msg.valor)
			});
			connection.on('close', function(reasonCode, description) {
				//console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
				connections.splice(connections.indexOf(connection), 1); // elimino la conexion
			});
		});

		cambio = function (dato, valor) {
			console.log('\x1Bc');
			console.log("---------------------------------");
			console.log("-            Electro            -");
			console.log("---------------------------------");
			console.log();
			console.log("Servidor web conectado en puerto 3000. Conectar con un navegador a:");
			console.log(" - http://localhost:3000/  (desde el mismo equipo)");
			console.log(" - http://<ip del servidor>:3000/  (desde otro equipo)");
			console.log("Conexiones:", connections.length);
			console.log();
			var i;
			console.log("SENSORES");
			for (i in sensores) {
				console.log(" - " + i + ":", sensores[i]);
			}
			console.log();
			console.log("PARAMETROS");
			for (i in parametros) {
				console.log(" - " + i + ":", parametros[i]);
			}
			if (! dato) return;
			// Enviar a los clientes conectados
			for (i = 0 ; i < connections.length ; i ++) {
				connections[i].sendUTF(JSON.stringify({ dato: dato, valor: valor }));
			}
		}
		cambio();

	} else {
		
		/* Funcionalidad para el navegador */
		hostname = location.hostname;
		window.electro = electro; // exponer la API en el objeto electro
		window.electroCambiar = cambiar;

		// Actualiza el panel
		function panel () {
			var html = "";
			
			function c (etq, dato, valor) {
				return "<a style='text-decoration: none; background-color: rgba(0,0,0,0.25);' href='#' onClick='cambiar(\"" + dato + "\", " + valor + "); return false;'>" + etq + "</a>";
			}
			
			html += "<pre><strong>Electro - Panel</strong></pre>";
			html += "<pre> </pre>"
			html += "<pre>-- Sensores -- </pre>";
			html += "<pre><strong>Prta. Frg.:</strong> " + (sensores.puerta ? "Abierta" : "Cerrada") + "</pre>";
			html += "<pre><strong>Temp. Ext.:</strong> " + sensores.tempExterior.toFixed(2) + "&deg;C</pre>";
			html += "<pre><strong>Temp. Int.:</strong> " + sensores.tempInterior.toFixed(2) + "&deg;C</pre>";
			html += "<pre><strong>   Consumo:</strong> " + sensores.consumo + "W</pre>";
			html += "<pre> </pre>"
			html += "<pre>-- Par&aacute;metros -- </div>";
			html += "<pre><strong>Rest. Sup.:</strong> " + (parametros.resistenciaSuperior ? "Encendido" : "Apagado") + "</pre>";
			html += "<pre><strong>Rest. Inf.:</strong> " + (parametros.resistenciaInferior ? "Encendido" : "Apagado") + "</pre>";
			html += "<pre><strong>Gratinador:</strong> " + (parametros.gratinador ? "Encendido" : "Apagado") + "</pre>";
			html += "<pre><strong>Ventilador:</strong> " + (parametros.ventilador ? "Encendido" : "Apagado") + "</pre>";
			html += "<pre><strong>    Pitido:</strong> " + (parametros.alarma ? "Encendida" : "Apagada") + "</pre>";
			
			document.getElementById("electro_panel").innerHTML = html;
		}

		// Opciones del panel
		var epVisible = false;
		var epH = 2;
		var epV = 0;
		
		// Aplica el estilo al panel en función de las opciones
		function estilo () {
			var ep = document.getElementById("electro_panel");
			ep.style.backgroundColor = "rgba(255,255,128,0.85)";
			ep.style.position = "fixed";
			ep.style.padding = "16px";
			ep.style.fontSize = "12px";
			ep.style.display = epVisible ? "block" : "none";
			ep.style.top = ["0", "25%", "auto"][epV];
			ep.style.bottom = ["auto", "auto", "0"][epV];
			ep.style.left = ["0", "25%", "auto"][epH];
			ep.style.right = ["auto", "auto", "0"][epH];
		}
		

		// Crear el panel
		document.getElementsByTagName("body")[0].innerHTML += "<code id='electro_panel'></code>";
		estilo();
		panel();
		
		// Botones de control del panel
		document.onkeypress = function (ev) {
			//console.log(ev.key, ev);
			switch (ev.key) {
				case "p": case "P": cambiar("puerta", ! sensores.puerta); break;
				case "+": cambiar("tempExterior", sensores.tempExterior + 1); break;
				case "-": cambiar("tempExterior", sensores.tempExterior - 1); break;
				case "0": epVisible = ! epVisible; estilo(); break; // 0 - mostrar / ocultar panel
				// 1-9 posicionar panel
				case "1":  epVisible = true; epH = 0, epV = 2; estilo(); break;
				case "2":  epVisible = true; epH = 1, epV = 2; estilo(); break;
				case "3":  epVisible = true; epH = 2, epV = 2; estilo(); break;
				case "4": epVisible = true; epH = 0, epV = 1; estilo(); break;
				case "5": epVisible = true; epH = 1, epV = 1; estilo(); break;
				case "6": epVisible = true; epH = 2, epV = 1; estilo(); break;
				case "7": epVisible = true; epH = 0, epV = 0; estilo(); break;
				case "8": epVisible = true; epH = 1, epV = 0; estilo(); break;
				case "9": epVisible = true; epH = 2, epV = 0; estilo(); break;
				default: return;
			}
			
			return false;
		};

		// iniciar
		if (hostname) {
			document.title += " (Conectado a " + hostname + ")";
			var ws = new WebSocket("ws://" + hostname + ":" + port + "/", "electro");
			ws.onopen = function (event) {
				console.log("Conectado con servidor!!!");
			};
			ws.onmessage = function (event) {
				//console.log("Mensaje:", event.data);
				var msg = JSON.parse(event.data);
				if (msg.dato == "hora") msg.valor = new Date(msg.valor)

				//console.log("Recibido cambio desde el servidor:", msg.dato, msg.valor);
				cambiar(msg.dato, msg.valor, false);

				// pitido activo ?
				if (parametros.pitido && msg.dato == "hora") beep();
				panel(); // actualizo el panel
			};
			cambio = function (dato, valor) {
				//console.log("Cambio en un dato notificar al servidor!!!", dato, valor);
				ws.send(JSON.stringify({ dato: dato, valor: valor }));
			}
			
		} else {

			document.title += " (LOCAL, sin conexión)";
			// Iniciar la ejecución local
			setInterval(function () {
				paso();
				if (parametros.pitido) beep();
			}, 1000);
			cambio = panel;
		}

		// Sonido de un pitido
		var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
		
		// Reproduce un pitido
		function beep() {
			snd.play();
		}
	}
})();
