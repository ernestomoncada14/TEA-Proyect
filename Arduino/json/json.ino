#include <ArduinoJson.h>

int pinSensor = 2;
int pinValvulaSolenoide = 10;
bool estadoValvula = true;

JsonDocument doc;  // Usar JsonDocument

void setup() {
  // Inicializar comunicación serial
  Serial.begin(9600);
  pinMode(pinValvulaSolenoide, OUTPUT);
  digitalWrite(pinValvulaSolenoide, HIGH);
  pinMode(pinSensor, INPUT);
  digitalWrite(pinSensor, HIGH);
}

void loop() {
  // Comprobar si hay datos disponibles en el puerto serial
  if (Serial.available() > 0) {
    // Leer los datos del puerto serial
    String jsonData = Serial.readString();

    // Deserializar el JSON recibido
    DeserializationError error = deserializeJson(doc, jsonData);

    // Comprobar si hubo un error al deserializar
    if (error) {
      Serial.println("Error al recibir el JSON");
      return;
    }

    // Leer los valores del JSON
    const char* nombre = doc["nombre"];
    int numero = doc["numero"];
    float flotante = doc["flotante"];
    bool activo = doc["activo"];

    // Imprimir los datos recibidos
    Serial.print("Nombre: ");
    Serial.println(nombre);
    Serial.print("Número: ");
    Serial.println(numero);
    Serial.print("Flotante: ");
    Serial.println(flotante);
    Serial.print("Activo: ");
    Serial.println(activo ? "Verdadero" : "Falso");
  }
}
