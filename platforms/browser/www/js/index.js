/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var db = null;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);

        iniciarBD();

        $("#txtCantidadLimite").blur(function() {
            guardarAlarmaCantidad();
        });

        $("#txtAcumuladoLimite").blur(function() {
            guardarAlarmaAcumulado();
        });

        $("#chbAlarma").on("change", function() {
            guardarAlarma();
        });

        $("#btnGuardar").on("click", function() {
            guardarRegistro();
        });

        document.addEventListener("pause", function(){mostrarSplash()}, false);
        document.addEventListener("resume", function(){cerrarSplash()}, false);

        /* setTimeout(function() { cerrarSplash() }, 3000); */

        cerrarSplash()
    }
};

/*************** Funciones de la aplicación ****************************/

function cerrarSplash() {
    setTimeout(function() {
        $("#divSplash").css("display","none");
        $("#divGap").slideDown();
        $("#divBarraOpciones").slideDown();
        $("#divPrincipal").slideDown();
    }, 2000);
} //cerrarSplash

function mostrarSplash() {
    $("#divGap").css("display","none");
    $("#divBarraOpciones").css("display","none");
    $("#divPrincipal").css("display","none");
    $("#divSplash").css("display","block");
} //mostrarSplash

function mostrarCapa(capa) {
    $("#divAgregar").css("display","none");
    $("#divVer").css("display","none");
    $("#divConfigurar").css("display","none");
    $("#divInformacion").css("display","none");
    $("#" + capa).slideDown();
    if (capa == "divConfigurar") {
        leerConfiguracion();
    }
    if (capa == "divVer") {
        consultar();
    }
} //mostrarCapa

//Se inicia y/o abre la base de datos
function iniciarBD() {
    db = window.openDatabase("pecunia.db", "1", "precunia", 2*1024*1024);
    db.transaction(function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS tbl_Movimientos (mov_Cantidad DECIMAL(15, 2), mov_Fecha DATE, mov_Concepto VARCHAR(20), mov_Notas VARCHAR(255))', [], onSuccess, onError);
    });
    function onSuccess(tx, result) {
        console.log("Tabla creada exitosamente");
    }
    function onError(tx, error) {
        alerta("", "Ocurrió un error al crear la base de datos", "red");
    }
} //iniciarBD

function leerConfiguracion() {
    if (localStorage.AlarmaCantidad) {
        $("#txtCantidadLimite").val(localStorage.AlarmaCantidad);
    }
    if (localStorage.AlarmaAcumulado) {
        $("#txtAcumuladoLimite").val(localStorage.AlarmaAcumulado);
    }
    if (localStorage.Alarma) {
        $("#chbAlarma").prop("checked",localStorage.Alarma);
    }
} //leerConfiguracion

function guardarAlarmaCantidad() {
    let inAlarmaCantidad = $("#txtCantidadLimite").val();
    localStorage.setItem("AlarmaCantidad", inAlarmaCantidad);
} //guardarAlarmaCantidad

function guardarAlarmaAcumulado() {
    let inAlarmaAcumulado = $("#txtAcumuladoLimite").val();
    localStorage.setItem("AlarmaAcumulado", inAlarmaAcumulado);
} //guardarAlarmaAcumulado

function guardarAlarma() {
    let bAlarma;
    ($("#chbAlarma").is(':checked')) ? bAlarma = true : bAlarma = false; 
    localStorage.setItem("Alarma", bAlarma);
} //guardarAlarma

function guardarRegistro() {
    if ($("#txtCantidad").val() > localStorage.AlarmaCantidad) {
        alerta("", "Esta cantidad excede el límite", "yellow");
        return;
    }

    var bTodo = true;
    if (($("#txtCantidad").val()=="")) {
        $("#txtCantidad").removeClass("campoTexto");
        $("#txtCantidad").addClass("campoTextoError");
        bTodo = false;
    }
    else {
        $("#txtCantidad").removeClass("campoTextoError");
        $("#txtCantidad").addClass("campoTexto");
    }
    
    if (($("#txtFecha").val()=="")) {
        $("#txtFecha").removeClass("campoTexto");
        $("#txtFecha").addClass("campoTextoError");
        bTodo = false;
    }
    else {
        $("#txtFecha").removeClass("campoTextoError");
        $("#txtFecha").addClass("campoTexto");
    }
    
     if ($("#selConcepto").children("option:selected").val()==0) {
        $("#selConcepto").removeClass("campoTexto");
        $("#selConcepto").addClass("campoTextoError");
        bTodo = false;
    }
    else {
        $("#selConcepto").removeClass("campoTextoError");
        $("#selConcepto").addClass("campoTexto");
    }
    
    if (bTodo) {
        let inCantidad = $("#txtCantidad").val();
        let stFecha = $("#txtFecha").val();
        let stConcepto = $("#selConcepto").children("option:selected").val();
        let stNotas = $.trim($("#txtNotas").val());
        db.transaction(function(tx) {
            var executeQuery = "INSERT INTO tbl_Movimientos VALUES (?,?,?,?)";
            tx.executeSql(executeQuery, [inCantidad, stFecha, stConcepto, stNotas], onSuccess, onError);
        });
        function onSuccess(tx, result) {
                alerta("Aviso", "INformación guardada", "blue");
                //Reinicio de los campos
                $("#txtCantidad").val("");
                $("#textFecha").val("");
                $("#selConcepto").val(0);
                $("#txtNotas").val("");
        }
        function onError(tx, error){
            alerta("", 'Ocurrió un error al intentar registrar' + error.message, "red");
        }
    }    
} //guardarRegistro

function alerta(titulo,mensaje,color) {
    $.alert({
        theme: "dark",
        title: titulo, 
        content: mensaje,
        type: color,
        typeAnimated: true,
        buttons: {
            Cerrar: {
                text: "Cerrar",
                btnClass: "btn-red",
                action: function() {}
            }
        }
    });
} //alerta

function consultar() {
    //Se borran los renglones de la tabla para volverla a llenar
    //$("#tblVer").find("tr:gt(0)").remove();
    $("#tblVer").html("");
    //mostrarCapa("consultar");
    var html = "";
    var inAcumulado = 0;
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM tbl_Movimientos ORDER BY mov_Fecha', [], onSuccess, onError);
    });

    function onSuccess(transaction, data) {
        for (i = 0; i < data.rows.length; i++) {
            html += "<tr><td class='celdaBoton' style='border: 1px solid whitesmoke;'><span class='textoTabla'>" + data.rows.item(i).mov_Cantidad + "</span></td>";
            html += "<td class='celdaBoton' style='border: 1px solid whitesmoke;'><span class='textoTabla'>" + data.rows.item(i).mov_Concepto + "</span></td>";
            html += "<td class='celdaBoton' style='border: 1px solid whitesmoke;'><span class='textoTabla'>" + data.rows.item(i).mov_Fecha + "</span></td>";
            html += "<td class='celdaBoton' style='border: 1px solid whitesmoke;'><span class='textoTabla'>" +  data.rows.item(i).mov_Notas + "</span></td>";
            inAcumulado += data.rows.item(i).mov_Cantidad;
            if (inAcumulado > localStorage.AlarmaAcumulado) {
                alerta("", "Se excedió el límite acumulado", "red")
            }
        };
        $('#tblVer').append(html);
    }

    function onError(tx, error) {
        alerta("", "Ocurrió un error al leer la información", "red");
    }
} //consultar