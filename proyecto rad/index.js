//////////////////////////////////////////////CONSTANTES///////////////////////////////////////////////// 

let mainWindows
let ventanaagregar

const {app, BrowserWindow, ipcRenderer, ipcMain, Menu , globalShortcut } =  require('electron');
const { webContents } = require('electron')
const mysql =  require('mysql');
const path = require('path');
const { format } = require('date-fns');

///////////////////////////////////////////////////////////////////////////////////////////////////////// 

///////////////////////////////// CREAR CONEXION CON LA BASE DE DATOS //////////////////////////////////

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '241522qQ',
	database: 'Basededatos_Rad'
});


///////////////////////////////////////////////////////////////////////////////////////////////////////// 

//////////////////////////////////////APLICACION EN EJECUCION ////////////////////////////////////////// 

app.on('ready', () => {

	mainWindows = new BrowserWindow({
		webPreferences:{
			nodeIntegration:true,
			nodeIntegrationInWorker:true},
        width: 1280,
        height: 720,
        fullscreen: false,
        icon: __dirname + '/images/icons/icono.ico'
    });
    
    mainWindows.loadURL(`file://${__dirname}/index.html`);

    globalShortcut.register('f5', function() {
		mainWindows.reload()
	})
	globalShortcut.register('CommandOrControl+R', function() {
        mainWindows.reload()
    })

    ipcMain.on('Prueba2',(e,row) => {
        crearventana();
    });

    ipcMain.on('salir',(e,row) => {
        ventanaagregar.close();
    });

    
}); 

const template = [
        {
            label: 'Console',
            submenu: [
                {
                    label: 'Mostrar devTOOLS',
                    role: 'toggledevtools'
                }
            ]
        }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

///////////////////////////////////////////////////////////////////////////////////////////////////////// 

//////////////////////////////////////  CREAR VENTANA AGREGAR  ////////////////////////////////////////// 
function crearventana(){

    ventanaagregar =  new BrowserWindow({
        title: "Agregar un Trabajador",
		webPreferences:{
			nodeIntegration:true,
            nodeIntegrationInWorker:true},
            
        width: 500,
        height: 630,
        fullscreen: false,
        frame: false,
        icon: __dirname + '/images/icons/icono.ico'
    });

    ventanaagregar.loadURL(`file://${__dirname}/ventanasemer/agregar.html`);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////// 


/////////////////////////////////  CONECTARSE CON LA BASE DE DATOS   ////////////////////////////////////

connection.connect(function(err) {
    // in case of error
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////// FUNCION PARA IMPRIMIR PRIMERA TABLA EN VENTANA MAIN ///////////////////////// 

function imprimirtabla(){
    let query = 'SELECT * FROM trabajadores inner join Periodo_de_Trabajo on trabajadores.id_trabajador = Periodo_de_Trabajo.id_trabajador';
    connection.query(query,function(err,rows,fields){
        if(err){
            console.log("Error al hacer la consulta");
            console.log(err.fatal);
            return
        }

        ipcMain.on('Prueba1',(e,row) => {
                mainWindows.webContents.send('Prueba1',rows);
        });
    })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

////////////// FUNCION PARA AGREGAR EN BD LO QUE RECIBE DE VENTANA AGREGAR TRABAJADOR ///////////////// 

ipcMain.on('outputagrega',(e,row) => {
          
        let itemInfo = {
            Nombre: row[0],
            Apellido: row[1],
            Rut: row[2],
            Huella: 'asjdasdh',
            Area: row[3],
            Volumen_de_horas: row[4],
            eliminado: 0
        };
        
        connection.query('INSERT INTO trabajadores SET ?', itemInfo);

        let consulta = 'select * from trabajadores where Nombre="'+row[0]+'"';
        connection.query(consulta,function(err,rows,fields){
            if(err){
                console.log("Error al hacer la consulta");
                console.log(err.fatal);
                return
            }
            connection.query('INSERT INTO Periodo_de_Trabajo(Inicio, Fin, id_trabajador) VALUES (NOW(), NOW(), '+rows[0].id_trabajador+')');
            imprimirtabla();
            mainWindows.reload();
            ventanaagregar.close();  
        })
            
});

///////////////////////////////////////////////////////////////////////////////////////////////////////

///////////// CUANDO GUARDE UN NUEVO TRABAJADOR CREE UNA ALERTA QUE AVISE QUE SE REALIZO //////////////

ipcMain.on('alertaxd',(e,row) => {
    mainWindows.webContents.send('ALERTA',"HOLI");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////

imprimirtabla();



