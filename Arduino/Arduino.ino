int sensorInterrupt = 0;  // interrupt 0
int sensorPin       = 2; //Digital Pin 2
int solenoidValve = 10; // Digital pin 5
bool valveState = true;
unsigned int SetPoint = 400; //400 milileter

/*The hall-effect flow sensor outputs pulses per second per litre/minute of flow.*/
float calibrationFactor = 90; //You can change according to your datasheet

volatile byte pulseCount =0;  

float flowRate = 0.0;
unsigned int flowMilliLitres =0;
unsigned long totalMilliLitres = 0;

unsigned long oldTime = 0;
unsigned long oldPrintTime = 0;

void setup()
{

  // Initialize a serial connection for reporting values to the host
  Serial.begin(9600);
  pinMode(solenoidValve , OUTPUT);
  digitalWrite(solenoidValve, HIGH);
  pinMode(sensorPin, INPUT);
  digitalWrite(sensorPin, HIGH);

  /*The Hall-effect sensor is connected to pin 2 which uses interrupt 0. Configured to trigger on a FALLING state change (transition from HIGH
  (state to LOW state)*/
  attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING); //you can use Rising or Falling
}

void loop()
{

   if((millis() - oldTime) > 1000)    // Only process counters once per second
  { 
    // Disable the interrupt while calculating flow rate and sending the value to the host
    detachInterrupt(digitalPinToInterrupt(sensorPin));

    // Because this loop may not complete in exactly 1 second intervals we calculate the number of milliseconds that have passed since the last execution and use that to scale the output. We also apply the calibrationFactor to scale the output based on the number of pulses per second per units of measure (litres/minute in this case) coming from the sensor.
    flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / calibrationFactor;

    // Note the time this processing pass was executed. Note that because we've
    // disabled interrupts the millis() function won't actually be incrementing right
    // at this point, but it will still return the value it was set to just before
    // interrupts went away.
    oldTime = millis();
    // Divide the flow rate in litres/minute by 60 to determine how many litres have
    // passed through the sensor in this 1 second interval, then multiply by 1000 to
    // convert to millilitres.
    flowMilliLitres = (flowRate / 60) * 1000;

    // Add the millilitres passed in this second to the cumulative total
    totalMilliLitres += flowMilliLitres;

    unsigned int frac;
    if((millis() - oldPrintTime) > 15000) {
      String mensaje = String(valveState) + ", " + String(totalMilliLitres);
      Serial.println(mensaje);
      oldPrintTime = millis();
    }
    
    if (totalMilliLitres > 1000)
    {
      totalMilliLitres = 0;
      SetSolinoidValve();
      delay(5000);
      SetSolinoidValve();
      oldTime = millis();
      oldPrintTime = millis();
    }
    
// Reset the pulse counter so we can start incrementing again
    pulseCount = 0;

    // Enable the interrupt again now that we've finished sending output
    attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING);
  }
}

//Insterrupt Service Routine

void pulseCounter()
{
  // Increment the pulse counter
  pulseCount++;
}

void SetSolinoidValve()
{
  if (valveState) {
    digitalWrite(solenoidValve, LOW);
    valveState = false;
  } else {
    digitalWrite(solenoidValve, HIGH);
    valveState = true;
  }
}
