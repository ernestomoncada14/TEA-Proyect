// Inclusión de librerías necesarias
#include <ArduinoJson.h>      // Para manejo de estructuras JSON
#include <TaskScheduler.h>    // Para tareas periódicas programadas
#include <RTClib.h>           // Para usar el reloj en tiempo real DS3231

RTC_DS3231 rtc;               // Objeto del reloj en tiempo real

// Definición de pines
const int pinMinValvulas = 10;   // Primer pin digital usado para válvulas
const int pinMaxValvulas = 13;   // Último pin digital usado para válvulas
const int pinMinSensores = 2;    // Primer pin digital usado para sensores de flujo
const int pinBomba = 7;          // Pin digital para activar la bomba
const int numSensores = 4;       // Número total de sensores de flujo

bool recibir_datos = false;      // Bandera para saber si se está recibiendo configuración JSON

// Nombres de los días de la semana
const char* dias[] = {"Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"};

// Pines físicos conectados a los sensores (deben permitir interrupciones)
int pinesParaUsarAtach[4] = {2,3,18,19};

// Estructura para almacenar los datos de cada sensor de flujo
struct SensorFlujo {
  int pin;
  volatile byte pulsos;
  float tasaFlujo;
  unsigned int flujoMililitros;
  unsigned long totalMililitros;
  unsigned long tiempoAnterior;
};

// Arreglo de sensores
SensorFlujo sensores[numSensores];

// Documento JSON para la configuración recibida
JsonDocument doc;

// Instancia del programador de tareas
Scheduler scheduler;

// Declaración de funciones
void verificarSerial();
void controlarValvulas();
void tareaFlujo();
void enviarDatosSerial();

// Funciones para interrupciones de sensores de flujo
void sensor0() { sensores[0].pulsos++; }
void sensor1() { sensores[1].pulsos++; }
void sensor2() { sensores[2].pulsos++; }
void sensor3() { sensores[3].pulsos++; }

// Arreglo de punteros a funciones para asignar las interrupciones dinámicamente
void (*interrupciones[4])() = {sensor0, sensor1, sensor2, sensor3};

// Definición de tareas periódicas (intervalo, repeticiones, función asociada)
Task tareaLeerSerial(2000, TASK_FOREVER, verificarSerial1);
Task tareaControlar(1000, TASK_FOREVER, controlarValvulas);
Task tareaContarFlujo(1000, TASK_FOREVER, tareaFlujo);
Task tareaEnviarDatos(5000, TASK_FOREVER, enviarDatosSerial);

// Función de configuración inicial
void setup() {
  Serial.begin(9600);              // Inicializar comunicación serial

  if (!rtc.begin()) {              // Verificar si el RTC está conectado
    while (1);                     // Si no, detener el sistema
  }

  while (!Serial);                 // Esperar que el puerto serial esté listo
  esperarConfiguracionRTC();      // Configurar la hora del RTC desde JSON

  // Configurar pines de salida para válvulas
  for (int i = pinMinValvulas; i <= pinMaxValvulas; i++) {
    pinMode(i, OUTPUT);
    digitalWrite(i, LOW);         // Inicialmente apagadas
  }

  pinMode(pinBomba, OUTPUT);      // Configurar pin de la bomba

  // Configurar sensores de flujo
  for (int i = 0; i < numSensores; i++) {
    sensores[i].pin = pinesParaUsarAtach[i];
    sensores[i].pulsos = 0;
    sensores[i].tasaFlujo = 0.0;
    sensores[i].flujoMililitros = 0;
    sensores[i].totalMililitros = 0;
    sensores[i].tiempoAnterior = millis();
    pinMode(sensores[i].pin, INPUT);
    attachInterrupt(digitalPinToInterrupt(sensores[i].pin), interrupciones[i], FALLING);  // Activar interrupción
  }

  // Agregar tareas al scheduler
  scheduler.addTask(tareaLeerSerial);
  scheduler.addTask(tareaControlar);
  scheduler.addTask(tareaContarFlujo);
  scheduler.addTask(tareaEnviarDatos);

  // Habilitar tareas
  tareaEnviarDatos.enable();
  tareaLeerSerial.enable();
  tareaControlar.enable();
  tareaContarFlujo.enable();
}

// Bucle principal: ejecuta las tareas programadas
void loop() {
  scheduler.execute();
}

// ------------------------------------------------------------------------------------------
// Función para leer y deserializar datos JSON recibidos por Serial
void verificarSerial1() {
  if (Serial.available()) {
    bool salir = false;
    int empty = 0;
    while (!salir) {
        const String jsonData = Serial.readStringUntil('\n');
        JsonDocument doc2;
        DeserializationError error = deserializeJson(doc2, jsonData);
        Serial.read();  // Limpiar un byte residual

        if (error) {
          // Si se recibe entrada vacía repetidamente, salir del ciclo
          String mensaje = error.c_str();
          if (mensaje == "EmptyInput") empty++;
          if (empty > 5) {
            salir = true;
            recibir_datos = false;
            break;
          }
          Serial.print(mensaje);
          Serial.println(", falso datos " + jsonData);
          recibir_datos = true;
        } else {
          // Si se deserializa correctamente, guardar configuración y salir
          doc.clear();
          deserializeJson(doc, jsonData);
          Serial.println("ok, ok datos");
          salir = true;
          recibir_datos = false;
          controlarValvulas();  // Aplicar cambios
        }
      delay(200);
    }
  }
}

// ------------------------------------------------------------------------------------------
// Controla la activación de válvulas y sensores de flujo según la programación recibida
void controlarValvulas() {
  if (!doc.isNull()) {
    DateTime now = rtc.now();  // Obtener la hora actual del RTC
    int horaActual = now.hour();
    int minutoActual = now.minute();
    int segundoActual = now.second();

    String diaActual = dias[now.dayOfTheWeek()]; // Convertir día numérico a texto

    // Apagar todas las válvulas al inicio
    for (int i = pinMinValvulas; i <= pinMaxValvulas; i++) {
      digitalWrite(i, LOW);
    }

    int cont = 0;
    int pinesValvulasActivas[4];
    int contS = 0;
    int idSensoresActivos[4];
    int valvulasAbiertas = 0;

    // Iterar sobre cada programación recibida en el JSON
    for (JsonObject prog : doc.as<JsonArray>()) {
      const char* horaInicioStr = prog["HoraInicio"];
      const char* horaFinalStr = prog["HoraFinal"];
      JsonArray diasProg = prog["Dias"];
      bool diaCoincide = false;

      // Verificar si el día actual coincide con alguno programado
      for (const char* d : diasProg) {
        if (diaActual.equals(d)) {
          diaCoincide = true;
          break;
        }
      }

      // Convertir horas a segundos para comparación
      int hI, mI, sI, hF, mF, sF;
      sscanf(horaInicioStr, "%d:%d:%d", &hI, &mI, &sI);
      sscanf(horaFinalStr, "%d:%d:%d", &hF, &mF, &sF);
      long tiempoActual = horaActual * 3600L + minutoActual * 60L + segundoActual;
      long tiempoInicio = hI * 3600L + mI * 60L + sI;
      long tiempoFinal = hF * 3600L + mF * 60L + sF;

      bool enHorario = diaCoincide && (tiempoActual >= tiempoInicio && tiempoActual <= tiempoFinal);

      // ---------- Control de válvulas ----------
      JsonArray valvulas = prog["Valvulas"];
      for (JsonObject valvula : valvulas) {
        int pin = valvula["Pin"];
        bool manualV = valvula["Manual"];
        bool estadoV = valvula["Estado"];

        // Activar válvula si está en modo manual y activada
        if (manualV && estadoV) {
          digitalWrite(pin, HIGH);
          valvulasAbiertas++;
        }

        // Activar válvula si está dentro del horario programado
        if ((enHorario) && pin >= pinMinValvulas && pin <= pinMaxValvulas) {
          digitalWrite(pin, HIGH);
          pinesValvulasActivas[cont++] = pin;
          valvulasAbiertas++;
          valvula["Estado"] = true;
          valvula["Manual"] = false;
        } else if (!manualV && !estaEnArray(pin, pinesValvulasActivas, 4)) {
          valvula["Estado"] = false;
          digitalWrite(pin, LOW);
        }
      }

      // ---------- Control de sensores ----------
      JsonArray Sensores = prog["Sensores"];
      for (JsonObject sensor : Sensores) {
        int id = sensor["SensorId"];
        int pinS = sensor["Pin"];
        int idx = id - 1;

        if (enHorario) {
          sensor["Estado"] = true;
          sensor["Manual"] = false;
          idSensoresActivos[contS++] = id;
        } else if (!sensor["Manual"] && !estaEnArray(id, idSensoresActivos, contS)) {
          sensor["Estado"] = false;
          sensores[idx].totalMililitros = 0;  // Reiniciar contador si está fuera de horario
        }
      }
    }

    // Activar bomba si alguna válvula está abierta
    digitalWrite(pinBomba, valvulasAbiertas > 0 ? HIGH : LOW);
  }
}

// ------------------------------------------------------------------------------------------
// Verifica si un valor está presente en un arreglo
bool estaEnArray(int valor, int arr[], int tam) {
  for (int i = 0; i < tam; i++) {
    if (arr[i] == valor) return true;
  }
  return false;
}

// ------------------------------------------------------------------------------------------
// Calcula el flujo de cada sensor y acumula el total en mililitros
void tareaFlujo() {
  for (int i = 0; i < numSensores; i++) {
    detachInterrupt(digitalPinToInterrupt(sensores[i].pin));  // Pausar interrupción

    unsigned long ahora = millis();
    float tasa = ((1000.0 / (ahora - sensores[i].tiempoAnterior)) * sensores[i].pulsos) / 90.0;
    sensores[i].tasaFlujo = tasa;
    sensores[i].flujoMililitros = (tasa / 60.0) * 1000;
    sensores[i].totalMililitros += sensores[i].flujoMililitros;
    sensores[i].tiempoAnterior = ahora;
    sensores[i].pulsos = 0;

    attachInterrupt(digitalPinToInterrupt(sensores[i].pin), interrupciones[i], FALLING);  // Reanudar interrupción
  }
}

// ------------------------------------------------------------------------------------------
// Envía los datos actuales de válvulas y sensores por Serial en formato JSON
void enviarDatosSerial() {
  if (!recibir_datos) {
    JsonDocument salida;
    int contS = 0;
    int idFlujo[5] = {0};
    int contV = 0;
    int pinesValv[4] = {0};

    JsonArray valvulas = salida["Valvulas"].to<JsonArray>();
    JsonArray sensoresArr = salida["Sensores"].to<JsonArray>();

    DateTime now = rtc.now();  // Obtener hora actual
    char fechaHora[25];
    sprintf(fechaHora, "%04d-%02d-%02dT%02d:%02d:%02d",
        now.year(), now.month(), now.day(),
        now.hour(), now.minute(), now.second());

    if (!doc.isNull()) {
      JsonArray programaciones = doc.as<JsonArray>();
      for (JsonObject prog : programaciones) {

        // Agregar estado de válvulas activas
        for (JsonObject valvula : prog["Valvulas"].as<JsonArray>()) {
          int pin = valvula["Pin"];
          if (pin >= pinMinValvulas && pin <= pinMaxValvulas && !estaEnArray(pin, pinesValv, contV)) {
            pinesValv[contV++] = pin;
            JsonObject v = valvulas.add<JsonObject>();
            v["ValvulaId"] = valvula["ValvulaId"];
            v["Estado"] = digitalRead(pin);
            v["Fecha"] = fechaHora;
          }
        }

        // Agregar estado y valor de flujo de sensores activos
        for (JsonObject sensor : prog["Sensores"].as<JsonArray>()) {
          int pin = sensor["Pin"];
          int id = sensor["SensorId"];
          if (estaEnArray(pin, pinesParaUsarAtach, 4) && !estaEnArray(id, idFlujo, contS)) {
            idFlujo[contS++] = id;
            int idx = id - 1;
            JsonObject s = sensoresArr.add<JsonObject>();
            s["SensorId"] = id;
            s["ValorFlujo"] = sensores[idx].totalMililitros;
            s["Estado"] = sensor["Estado"];
            s["Fecha"] = fechaHora;
          }
        }
      }
    }

    // Enviar JSON completo por Serial
    serializeJson(salida, Serial);
    Serial.println();  // Fin de línea
  }
}

// ------------------------------------------------------------------------------------------
// Espera configuración de fecha y hora del RTC mediante JSON enviado por Serial
void esperarConfiguracionRTC() {
  int enviar = 0;
  while (true) {
    if (Serial.available()) {
      String jsonStr = Serial.readStringUntil('\n');
      JsonDocument docT;
      DeserializationError error = deserializeJson(docT, jsonStr);

      if (!error) {
        int dia = docT["dia"];
        int fecha = docT["fecha"];
        int mes = docT["mes"];
        int anio = docT["anio"];
        int hora = docT["hora"];
        int minuto = docT["minuto"];
        int segundo = docT["segundo"];

        rtc.adjust(DateTime(anio, mes, fecha, hora, minuto, segundo));
        Serial.println("ok, ok time");
        return; // RTC configurado, salir
      } else {
        Serial.println(error.c_str());  // Mostrar error
      }
    }
    enviar++;
    delay(200);
  }
}
