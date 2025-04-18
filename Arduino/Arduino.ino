#include <ArduinoJson.h>
#include <TaskScheduler.h>
#include <RTClib.h>

RTC_DS3231 rtc;

// Configuración de pines
const int pinMinValvulas = 10;
const int pinMaxValvulas = 13;
const int pinMinSensores = 2;
const int pinBomba = 7;
const int numSensores = 4;  // Solo 4 sensores de flujo en este ejemplo
bool recibir_datos = false;
const char* dias[] = {"Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"};
int pinesParaUsarAtach[4] = {2,3,18,19};

// Estructura del sensor de flujo
struct SensorFlujo {
  int pin;
  volatile byte pulsos;
  float tasaFlujo;
  unsigned int flujoMililitros;
  unsigned long totalMililitros;
  unsigned long tiempoAnterior;
};

SensorFlujo sensores[numSensores];

// Documentos y programador
JsonDocument doc;
Scheduler scheduler;

// Declaración de funciones
void verificarSerial();
void controlarValvulas();
void tareaFlujo();
void enviarDatosSerial();

void sensor0() { sensores[0].pulsos++; }
void sensor1() { sensores[1].pulsos++; }
void sensor2() { sensores[2].pulsos++; }
void sensor3() { sensores[3].pulsos++; }

void (*interrupciones[4])() = {sensor0, sensor1, sensor2, sensor3};

// Tareas programadas
Task tareaLeerSerial(2000, TASK_FOREVER, verificarSerial1);
Task tareaControlar(1000, TASK_FOREVER, controlarValvulas);
Task tareaContarFlujo(1000, TASK_FOREVER, tareaFlujo);
Task tareaEnviarDatos(5000, TASK_FOREVER, enviarDatosSerial);

// Setup
void setup() {
  Serial.begin(9600);
  if (!rtc.begin()) {
    while (1); // Detener si no se encuentra el RTC
  }
  while (!Serial);
  esperarConfiguracionRTC();

  // Configurar pines válvula
  for (int i = pinMinValvulas; i <= pinMaxValvulas; i++) {
    pinMode(i, OUTPUT);
    digitalWrite(i, LOW);
  }

  pinMode(pinBomba, OUTPUT);

  // Configurar sensores
  for (int i = 0; i < numSensores; i++) {
    sensores[i].pin = pinesParaUsarAtach[i];
    sensores[i].pulsos = 0;
    sensores[i].tasaFlujo = 0.0;
    sensores[i].flujoMililitros = 0;
    sensores[i].totalMililitros = 0;
    sensores[i].tiempoAnterior = millis();
    pinMode(sensores[i].pin, INPUT);
    attachInterrupt(digitalPinToInterrupt(sensores[i].pin), interrupciones[i], FALLING);
  }

  //verificarSerial1();
  // Agregar tareas al scheduler
  scheduler.addTask(tareaLeerSerial);
  scheduler.addTask(tareaControlar);
  scheduler.addTask(tareaContarFlujo);
  scheduler.addTask(tareaEnviarDatos);
  tareaEnviarDatos.enable();
  tareaLeerSerial.enable();
  tareaControlar.enable();
  tareaContarFlujo.enable();
}

// Loop principal
void loop() {
  scheduler.execute();
}

void verificarSerial1() {
  if (Serial.available()) {
    bool salir = false;
    int empty = 0;
    while (!salir) {
        const String jsonData = Serial.readStringUntil('\n');
        JsonDocument doc2;
        DeserializationError error = deserializeJson(doc2, jsonData);
        Serial.read();
        if (error) {
          String mensaje = error.c_str();
          if (mensaje == "EmptyInput") {
            empty++;
          }
          if (empty > 5) {
            salir = true;
            recibir_datos = false;
            break;
          }
          Serial.print(mensaje);
          Serial.println(", falso datos " + jsonData);
          recibir_datos = true;
        } else {
          doc.clear();
          deserializeJson(doc, jsonData);
          Serial.println("ok, ok datos");
          salir = true;
          recibir_datos = false;
          controlarValvulas();
        }
      delay(200);
    }
  }
}

// controlar válvulas y sensores desde JSON con lógica de horario
void controlarValvulas() {
  if (!doc.isNull()) {
    // Obtener hora actual del RTC
    DateTime now = rtc.now();

    int horaActual = now.hour();
    int minutoActual = now.minute();
    int segundoActual = now.second();
    int valvulasAbiertas = 0;
    //DayOfWeek diaActualEnum = now.getDayOfWeek();

    // Convertir a string como está en el JSON: "Lunes", "Martes", etc.
    String diaActual = dias[now.dayOfTheWeek()];

    // Apagar todas las válvulas antes de aplicar reglas
    for (int i = pinMinValvulas; i <= pinMaxValvulas; i++) {
      digitalWrite(i, LOW);
    }

    int cont = 0;
    int pinesValvulasActivas[4];
    int contS = 0;
    int idSensoresActivos[4];
    
    for (JsonObject prog : doc.as<JsonArray>()) {
      const char* horaInicioStr = prog["HoraInicio"];
      const char* horaFinalStr = prog["HoraFinal"];
      JsonArray diasProg = prog["Dias"];
      bool diaCoincide = false;

      // Verificar si hoy es uno de los días definidos
      for (const char* d : diasProg) {
        if (diaActual.equals(d)) {
          diaCoincide = true;
          break;
        }
      }

      // Extraer horas y minutos de los strings
      int hI, mI, sI, hF, mF, sF;
      sscanf(horaInicioStr, "%d:%d:%d", &hI, &mI, &sI);
      sscanf(horaFinalStr, "%d:%d:%d", &hF, &mF, &sF);

      // Convertir todo a segundos para comparar
      long tiempoActual = horaActual * 3600L + minutoActual * 60L + segundoActual;
      long tiempoInicio = hI * 3600L + mI * 60L + sI;
      long tiempoFinal = hF * 3600L + mF * 60L + sF;

      bool enHorario = diaCoincide && (tiempoActual >= tiempoInicio && tiempoActual <= tiempoFinal);
      // -------- VALVULAS --------
      JsonArray valvulas = prog["Valvulas"];
      for (JsonObject valvula : valvulas) {
        int pin = valvula["Pin"];
        bool manualV = valvula["Manual"];
        bool estadoV = valvula["Estado"];

        if (manualV && estadoV) {
          digitalWrite(pin, HIGH);
          valvulasAbiertas++;
        }
        
        if ((enHorario) && pin >= pinMinValvulas && pin <= pinMaxValvulas) {
          digitalWrite(pin, HIGH);
          pinesValvulasActivas[cont] = pin;
          cont++;
          valvulasAbiertas++; 
          valvula["Estado"] = true;  // Forzar estado activo en horario
          valvula["Manual"] = false; 
        } else if (estaEnArray(pin, pinesValvulasActivas, 4)) {
          continue;
        } else {
          if (!manualV) {
            valvula["Estado"] = false;
            digitalWrite(pin, LOW);
          }
        }
      }
      
      // -------- SENSORES --------
      JsonArray Sensores = prog["Sensores"];
      for (JsonObject sensor : Sensores) {
        
        int id = sensor["SensorId"];
        int pinS = sensor["Pin"];
        int idx = id - 1;

        if (enHorario) {
          sensor["Estado"] = true;
          sensor["Manual"] = false;
          idSensoresActivos[contS] = id;
          contS++;
        } else if (estaEnArray(id, idSensoresActivos, contS)) {
          continue;
        } else {
          bool manualS = sensor["Manual"];
          if (!manualS) {
            sensor["Estado"] = false;
            sensores[idx].totalMililitros = 0;
          }
        }
        
      }
      
    }
    if (valvulasAbiertas > 0) {
      digitalWrite(pinBomba, HIGH);
    } else {
      digitalWrite(pinBomba, LOW);
    }
  }
}

bool estaEnArray(int valor, int arr[], int tam) {
  for (int i = 0; i < tam; i++) {
    if (arr[i] == valor) return true;
  }
  return false;
}

// contar flujo de cada sensor
void tareaFlujo() {
  for (int i = 0; i < numSensores; i++) {
    detachInterrupt(digitalPinToInterrupt(sensores[i].pin));

    unsigned long ahora = millis();
    float tasa = ((1000.0 / (ahora - sensores[i].tiempoAnterior)) * sensores[i].pulsos) / 90.0;
    sensores[i].tasaFlujo = tasa;
    sensores[i].flujoMililitros = (tasa / 60.0) * 1000;
    sensores[i].totalMililitros += sensores[i].flujoMililitros;
    sensores[i].tiempoAnterior = ahora;
    sensores[i].pulsos = 0;

    attachInterrupt(digitalPinToInterrupt(sensores[i].pin), interrupciones[i], FALLING);
  }
}

void enviarDatosSerial() {
  if (!recibir_datos) {
    JsonDocument salida;
    int contS = 0;
    int idFlujo[5] = {0};
    int contV = 0;
    int pinesValv[4] = {0};

    JsonArray valvulas = salida["Valvulas"].to<JsonArray>();
    JsonArray sensoresArr = salida["Sensores"].to<JsonArray>();

    // Obtener la hora actual del RTC
    DateTime now = rtc.now();

    // Convertir a formato ISO 8601: YYYY-MM-DDTHH:MM:SS
    char fechaHora[25];
    sprintf(fechaHora, "%04d-%02d-%02dT%02d:%02d:%02d",
        now.year(), now.month(), now.day(),
        now.hour(), now.minute(), now.second());

    if (!doc.isNull()) {
      
      JsonArray programaciones = doc.as<JsonArray>();
      for (JsonObject prog : programaciones) {
        
        JsonArray valvulasProg = prog["Valvulas"].as<JsonArray>();
        for (JsonObject valvula : valvulasProg) {
          int pin = valvula["Pin"];
          if (pin >= pinMinValvulas && pin <= pinMaxValvulas && !estaEnArray(pin, pinesValv, contV)) {
            pinesValv[contV] = pin;
            contV++;
            JsonObject v = valvulas.add<JsonObject>();
            v["ValvulaId"] = valvula["ValvulaId"];
            v["Estado"] = digitalRead(pin);
            v["Fecha"] = fechaHora;
          }
        }

        JsonArray sensoresProg = prog["Sensores"].as<JsonArray>();
        for (JsonObject sensor : sensoresProg) {
          int pin = sensor["Pin"];
          int id = sensor["SensorId"];
          if (estaEnArray(pin, pinesParaUsarAtach, 4)) {
            if (!estaEnArray(id, idFlujo, contS)) {
              idFlujo[contS] = id;
              contS++;
              int idx = id - 1;
//              int idx = pin - pinMinSensores;
              JsonObject s = sensoresArr.add<JsonObject>();
              s["SensorId"] = sensor["SensorId"];
              s["ValorFlujo"] = sensores[idx].totalMililitros;
              s["Estado"] = sensor["Estado"];
              s["Fecha"] = fechaHora;
            }
          }
        }
      }
    }

    serializeJson(salida, Serial);
    Serial.println();  // Separador de línea
  }
}




//-------------------------------------------------------configurar tiempo-------------------------------------------------------------------------------------



void esperarConfiguracionRTC() {
  int enviar = 0;
  while (true) {
    if (Serial.available()) {
      String jsonStr = Serial.readStringUntil('\n');

      // Crear el documento JSON y deserializar
      JsonDocument docT;
      DeserializationError error = deserializeJson(docT, jsonStr);

      if (!error) {
        int dia = docT["dia"];        // 1 = Lunes, ..., 7 = Domingo
        int fecha = docT["fecha"];    // Día del mes
        int mes = docT["mes"];        // 1 a 12
        int anio = docT["anio"];
        int hora = docT["hora"];
        int minuto = docT["minuto"];
        int segundo = docT["segundo"];

        rtc.adjust(DateTime(anio, mes, fecha, hora, minuto, segundo));

        Serial.println("ok, ok time");
        return; // Salir del while, continuar setup
      } else {
        Serial.println(error.c_str());
      }
    }
    enviar++;
    if (enviar > 10) {
      // Serial.println("time");
    }
    delay(200);
  }
}
