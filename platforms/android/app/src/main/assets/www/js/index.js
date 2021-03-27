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
        iniciarConfiguracion();

        $("#txtCantidadLimite").blur(function() {
            guardarAlarmaCantidad();
        });

        $("#txtAcumuladoLimite").blur(function() {
            guardarAlarmaAcumulado();
        });

        $("#chbAlarma").on("change", function() {
            if ($("#chbAlarma").prop("checked") === true) {
                if ($("#txtCantidadLimite").val() == "") {
                    $("#txtCantidadLimite").val("0");
                }
                if ($("#txtAcumuladoLimite").val() == "") {
                    $("#txtAcumuladoLimite").val("0");
                }
                if (($("#txtCantidadLimite").val() == "0") && ($("#txtAcumuladoLimite").val() == "0")) {
                    $("#chbAlarma").prop("checked",false)
                    alerta("Aviso","No se puede activar la alarma porque no hay ningún límite establecido", "orange");
                    return;
                }             
            }
            guardarAlarma(); 
        });

        $("#btnGuardar").on("click", function() {
            guardarRegistro();
        });

        $("#btnCancelar").on("click", function() {
            limpiarCampos();
        });

        $(".barra-separacion").on("click", function() {
            mostrarCapa("div" + $(this).attr("id")); 
        });

        $("#btnEfectivo").on("click", function() {
            consultar(1);
        });

        $("#btnTarjeta").on("click", function() {
            consultar(2);
        });

        $("#btnAplicacion").on("click", function() {
            consultar(3);
        });

        $("#btnCheque").on("click", function() {
            consultar(4);
        });

        $("#txtBuscar").on("keyup", function() {
            ($("#txtBuscar").val() !== "") ? buscar() : consultar(0);
        });

        $("#txtCantidad").blur(function() {
            if ((localStorage.Alarma == "true") && (parseFloat(localStorage.AlarmaCantidad) > 0) && (parseFloat($("#txtCantidad").val()) > parseFloat(localStorage.AlarmaCantidad))) {
                $("#txtCantidad").addClass("form-control-aviso");
                $("#tdAvisoLimite").html("Límite de cantidad excedido");
                $("#tdAvisoLimite").css("visibility","visible");
            }
        
            if ((localStorage.Alarma == "true") && (parseFloat(localStorage.AlarmaAcumulado) > 0) && (parseFloat($("#txtCantidad").val())+parseFloat(localStorage.Acumulado) > parseFloat(localStorage.AlarmaAcumulado))) {
                $("#txtCantidad").addClass("form-control-aviso");
                $("#tdAvisoAcumulado").html("Límite de acumulado excedido");
                $("#tdAvisoAcumulado").css("visibility","visible");
            }
        });
        /* document.addEventListener("pause", function(){mostrarSplash()}, false);
        document.addEventListener("resume", function(){cerrarSplash()}, false);

        setTimeout(function() { cerrarSplash() }, 3000); */

        //cerrarSplash()
    }
};

//Definición de variables y constantes
let arrConceptos = ["Efectivo", "Tarjeta", "Aplicación", "Cheque"];
let arrColores   = ["#FF3636", "#18ce0f", "#2CA8FF", "#FFB236"]; //rojo verde azul amarillo

/*************** Funciones de la aplicación ****************************/

/* function cerrarSplash() {
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
} //mostrarSplash */

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
        consultar(0);
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

function iniciarConfiguracion() {
    if (!localStorage.AlarmaCantidad) {
        localStorage.AlarmaCantidad = 0;
    }
    if (!localStorage.AlarmaAcumulado) {
        localStorage.AlarmaAcumulado = 0;
    }
    if (!localStorage.Alarma) {
        localStorage.Alarma = "false";
    }
    if (!localStorage.Acumulado) {
        localStorage.Acumulado = 0;
    }
} //iniciarConfiguracion

function leerConfiguracion() {
    if (localStorage.AlarmaCantidad) {
        $("#txtCantidadLimite").val(localStorage.AlarmaCantidad);
    }
    if (localStorage.AlarmaAcumulado) {
        $("#txtAcumuladoLimite").val(localStorage.AlarmaAcumulado);
    }
    if (localStorage.Alarma) {
        $("#chbAlarma").prop("checked",(localStorage.Alarma == "true"));
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
                alerta("Aviso", "Información guardada", "blue");
                //Se actualiza el importe Acumulado
                localStorage.Acumulado = parseFloat(localStorage.Acumulado) + parseFloat($("#txtCantidad").val());
                //Reinicio de los campos
                limpiarCampos();
        }
        function onError(tx, error){
            alerta("", 'Ocurrió un error al intentar registrar' + error.message, "red");
        }
    }    
} //guardarRegistro

function limpiarCampos() {
    $("#txtCantidad").val("");
    $("#txtCantidad").removeClass("form-control-aviso");
    $("#tdAvisoLimite").css("visibility","hidden");
    $("#tdAvisoLimite").html("");
    $("#tdAvisoAcumulado").css("visibility","hidden");
    $("#tdAvisoAcumulado").html("");
    $("#selConcepto").val(0);
    $("#txtFecha").val("");
    $("#txtNotas").val("");
} //limpiarCampos

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

function consultar(inTipo) {
    $("#lstRegistros").empty();
    //contarRegistros();
    var inAcumulado = 0;
    db.transaction(function (transaction) {
        if (inTipo == 0) transaction.executeSql('SELECT * FROM tbl_Movimientos ORDER BY mov_Fecha DESC', [], onSuccess, onError)
        else transaction.executeSql('SELECT * FROM tbl_Movimientos WHERE mov_Concepto = ' + inTipo + ' ORDER BY mov_Fecha DESC', [], onSuccess, onError);
    });

    function onSuccess(transaction, data) {
        if (data.rows.length > 0) {
            for (i = 0; i < data.rows.length; i++) {
                $("#lstRegistros").append(`<li id='registro${i}'>` + arrConceptos[data.rows.item(i).mov_Concepto-1] + "<br />" + data.rows.item(i).mov_Fecha + "     " + ((data.rows.item(i).mov_Cantidad).toFixed(2)).toString().padEnd(210,"&nbsp;") + "<span onclick='navigator.notification.alert(\"" + data.rows.item(i).mov_Notas + "\")' class='material-icons tamano-icono-barra color-icono-barra'>insert_comment</span></li>");
                $(`#registro${i}`).addClass("tarjeta-tipo tarjeta-tipo-oscuro");
                $(`#registro${i}`).css("border-left-color",`${arrColores[data.rows.item(i).mov_Concepto-1]}`);
                inAcumulado += data.rows.item(i).mov_Cantidad;
                if (parseFloat(inAcumulado) > parseFloat(localStorage.AlarmaAcumulado)) {
                    alerta("", "Se excedió el límite acumulado", "red")
                }
            };
        }
        else {
            $(".empty-item").css("display", "block");
        }
        contarRegistros();
    }

    function onError(tx, error) {
        alerta("", "Ocurrió un error al leer la información", "red");
    }
} //consultar

function contarRegistros() {
    var inCuentaLista = $("#lstRegistros li").length;
    $("#sNumReg").html(inCuentaLista);
} //contarRegistros

function buscar() {
    $("#lstRegistros").empty();
    //contarRegistros();
    let stParcial = $("#txtBuscar").val();
    db.transaction(function (transaction) {
        transaction.executeSql(`SELECT * FROM tbl_Movimientos WHERE mov_Notas LIKE '%${stParcial}%' ORDER BY mov_Fecha DESC`, [], onSuccess, onError);
    });

    function onSuccess(transaction, data) {
        if (data.rows.length > 0) {
            for (i = 0; i < data.rows.length; i++) {
                $("#lstRegistros").append(`<li id='registro${i}'>` + arrConceptos[data.rows.item(i).mov_Concepto-1] + "<br />" + data.rows.item(i).mov_Fecha + "     " + ((data.rows.item(i).mov_Cantidad).toFixed(2)).toString().padEnd(210,"&nbsp;") + "<span onclick='navigator.notification.alert(\"" + data.rows.item(i).mov_Notas + "\")' class='material-icons tamano-icono-barra color-icono-barra'>insert_comment</span></li>");
                $(`#registro${i}`).addClass("tarjeta-tipo tarjeta-tipo-oscuro");
                $(`#registro${i}`).css("border-left-color",`${arrColores[data.rows.item(i).mov_Concepto-1]}`);
            };
        }
        else {
            $(".empty-item").css("display", "block");
        }
        contarRegistros();
    }

    function onError(tx, error) {
        alerta("", "Ocurrió un error al leer la información", "red");
    }
} //buscar