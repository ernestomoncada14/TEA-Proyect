#include <TaskScheduler.h>

int pinSensor = 2; // Pin digital 2
int pinValvulaSolenoide = 10; // Pin digital 10
bool estadoValvula = true;
unsigned int puntoAjuste = 400; // 400 mililitros

float factorCalibracion = 90; // Puedes cambiarlo según tu hoja de datos

volatile byte contadorPulsosP = 0;  // Contador de pulsos

float tasaFlujo = 0.0;
unsigned int flujoMililitros = 0;
unsigned long totalMililitros = 0;

unsigned long tiempoAnterior = 0;
unsigned long tiempoImpresionAnterior = 0;

Scheduler programador; // Crea un objeto para el scheduler

// Declarar las funciones de las tareas antes de usarlas
void tareaContarFlujo();
void tareaImprimirDatos();
void tareaControlarValvula();

// Tarea para contar los pulsos
Task tareaContarFlujoT(1000, TASK_FOREVER, tareaContarFlujo); // 1000ms = 1 segundo

// Tarea para imprimir los resultados
Task tareaImprimirDatosT(15000, TASK_FOREVER, tareaImprimirDatos); // 15000ms = 15 segundos

// Tarea para controlar la válvula
Task tareaControlarValvulaT(1000, TASK_FOREVER, tareaControlarValvula); // 1000ms = 1 segundo

void setup() {
  // Inicializar comunicación serial
  Serial.begin(9600);
  pinMode(pinValvulaSolenoide, OUTPUT);
  digitalWrite(pinValvulaSolenoide, HIGH);
  pinMode(pinSensor, INPUT);
  digitalWrite(pinSensor, HIGH);

  // Configurar la interrupción para contar los pulsos del sensor
  attachInterrupt(digitalPinToInterrupt(pinSensor), contadorPulsos, FALLING);

  // Agregar tareas al scheduler
  programador.addTask(tareaContarFlujoT);
  programador.addTask(tareaImprimirDatosT);
  programador.addTask(tareaControlarValvulaT);

  tareaContarFlujoT.enable();
  tareaImprimirDatosT.enable();
  tareaControlarValvulaT.enable();
}

void loop() {
  // Llamar al scheduler en el loop
  programador.execute();
}

// Tarea para contar el flujo (se ejecuta cada 1 segundo)
void tareaContarFlujo() {
  detachInterrupt(digitalPinToInterrupt(pinSensor));  // Desactivar interrupción para evitar problemas con el contador

  tasaFlujo = ((1000.0 / (millis() - tiempoAnterior)) * contadorPulsosP) / factorCalibracion;
  tiempoAnterior = millis();

  flujoMililitros = (tasaFlujo / 60) * 1000;
  totalMililitros += flujoMililitros;

  contadorPulsosP = 0; // Resetear el contador de pulsos

  attachInterrupt(digitalPinToInterrupt(pinSensor), contadorPulsos, FALLING);  // Reactivar la interrupción
}

// Tarea para imprimir los datos (se ejecuta cada 15 segundos)
void tareaImprimirDatos() {
  String mensaje = String(estadoValvula) + ", " + String(totalMililitros);
  Serial.println(mensaje);
}

// Tarea para controlar la válvula (se ejecuta cada 1 segundo)
void tareaControlarValvula() {
  if (totalMililitros > 1000) {
    totalMililitros = 0;
    cambiarEstadoValvulaSolenoide();
    delay(5000);  // Esperar 5 segundos con la válvula cerrada
    cambiarEstadoValvulaSolenoide();
  }
}

void contadorPulsos() {
  contadorPulsosP++;  // Incrementar el contador de pulsos
}

void cambiarEstadoValvulaSolenoide() {
  if (estadoValvula) {
    digitalWrite(pinValvulaSolenoide, LOW);  // Apagar la válvula
    estadoValvula = false;
  } else {
    digitalWrite(pinValvulaSolenoide, HIGH);  // Encender la válvula
    estadoValvula = true;
  }
}
