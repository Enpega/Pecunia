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
        $("#txtCantidadLimite").blur(function() {
            guardarAlarmaCantidad();
        });

        $("#txtAcumuladoLimite").blur(function() {
            guardarAlarmaAcumulado();
        });

        $("#chbAlarma").on("change", function() {
            guardarAlarma();
        });
    }
};

/*************** Funciones de la aplicación ****************************/

function mostrarCapa(capa) {
    $("#divAgregar").css("display","none");
    $("#divVer").css("display","none");
    $("#divConfigurar").css("display","none");
    $("#divInformacion").css("display","none");
    $("#" + capa).slideDown();
    if (capa == "divConfigurar") {
        leerConfiguracion();
    }
} //mostrarCapa

//Se inicia y/o abre la base de datos
function iniciarBD() {
    db = window.openDatabase("cibus.db", "1", "cibus", 2*1024*1024);
    db.transaction(function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS tbl_Registro (reg_Estacion VARCHAR(50), reg_Km INT, reg_Litros INT, reg_Fecha DATE)', [], onSuccess, onError);
    });
    function onSuccess(tx, result) {
        console.log("Tabla creada exitosamente");
    }
    function onError(tx, error) {
        $.alert({
            theme: "dark",
            title:"Error", 
            content: "Ocurrió un error al crear la base de datos",
            type: "red",
            typeAnimated: true,
            buttons: {
                Cerrar: {
                    text: Cerrar,
                    btnClass: red,
                    action: function() {}
                }
            }
        });
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