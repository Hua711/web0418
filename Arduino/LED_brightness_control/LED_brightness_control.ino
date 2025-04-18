// LED 亮度控制程式
// LED 接在 Pin 10（PWM 輸出腳位）
// 可調式旋鈕接在 A0（類比輸入腳位）

const int LED_PIN = 10;      // LED 接腳
const int POT_PIN = A0;      // 可調式旋鈕接腳

void setup() {
  // 設定 LED_PIN 為輸出模式
  pinMode(LED_PIN, OUTPUT);
  
  // 開啟序列埠監控，方便觀察數值（選擇性）
  Serial.begin(9600);
}

void loop() {
  // 讀取可調式旋鈕的值（0-1023）
  int potValue = analogRead(POT_PIN);
  
  // 將可調式旋鈕的值（0-1023）映射到 LED 亮度範圍（0-255）
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // 使用 PWM 輸出控制 LED 亮度
  analogWrite(LED_PIN, brightness);
  
  // 在序列埠監控視窗顯示目前的亮度值（選擇性）
  Serial.print("可調式旋鈕值: ");
  Serial.print(potValue);
  Serial.print("\t LED 亮度: ");
  Serial.println(brightness);
  
  // 小延遲以避免數值更新太快
  delay(100);
}