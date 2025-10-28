#!/usr/bin/env python3
"""
==========================
Simulador MQTT para Testing
==========================
Publica datos simulados a los 3 tópicos MQTT cada 30 segundos:
- gateway/gateway: Estado del gateway
- gateway/endpoint: Endpoints conectados
- gateway/sensor: Datos de sensores

Uso: python test_mqtt_sender.py
"""

import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime

# =========================
# CONFIGURACIÓN MQTT
# =========================
# Si ejecutas desde el host (fuera de Docker), usar localhost
# Si ejecutas desde Docker, usar silo-mosquitto
MQTT_BROKER_HOST = "localhost"  # Cambiar a "silo-mosquitto" para ejecución en Docker
MQTT_BROKER_PORT = 1883
MQTT_BROKER_USERNAME = ""
MQTT_BROKER_PASSWORD = ""

# Número de gateways, endpoints y sensores a simular
NUM_GATEWAYS = 3
NUM_ENDPOINTS = 3
NUM_SENSORS = 4

# =========================
# CONFIGURACIÓN DE RANGOS
# =========================
TEMP_MIN = 15.0
TEMP_MAX = 30.0
HUMIDITY_MIN = 40
HUMIDITY_MAX = 80
BATTERY_MIN = 50
BATTERY_MAX = 100

# Generar datos más realistas con variación en estados
REALISTIC_MODE = True  # Activar para estados más variados


def generate_uptime():
    """Genera un tiempo de actividad aleatorio"""
    hours = random.randint(0, 23)
    minutes = random.randint(0, 59)
    seconds = random.randint(0, 59)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def generate_sensor_id(index):
    """Genera ID de sensor (0F01, 0F02, etc.)"""
    return f"0F{index:02d}"


def generate_gateway_data(gateway_id):
    """Genera datos para el tópico gateway/gateway"""
    wifi_signals = ["excelente", "buena", "regular", "débil"]
    lora_statuses = ["ok", "ok", "ok", "warning"]  # Mayormente ok
    lora_status = random.choice(lora_statuses)
    
    return {
        "id_gateway": gateway_id,
        "wifi_signal": random.choice(wifi_signals),
        "lora_status": lora_status,
        "uptime": generate_uptime()
    }


def generate_endpoint_data(gateway_id, num_endpoints=NUM_ENDPOINTS):
    """Genera datos para el tópico gateway/endpoint"""
    endpoints = []
    
    for i in range(1, num_endpoints + 1):
        endpoint_id = f"E{i:02d}"
        bateria = random.randint(BATTERY_MIN, BATTERY_MAX)
        cargando = bateria < 95
        
        endpoints.append({
            "id": endpoint_id,
            "bateria": bateria,
            "cargando": cargando,
            "lora": "ok",
            "sensores": NUM_SENSORS
        })
    
    return {
        "id_gateway": gateway_id,
        "endpoints": endpoints
    }


def generate_sensor_data(gateway_id, num_endpoints=NUM_ENDPOINTS, num_sensors=NUM_SENSORS):
    """Genera datos para el tópico gateway/sensor"""
    endpoints = []
    
    for e in range(1, num_endpoints + 1):
        endpoint_id = f"E{e:02d}"
        sensores = []
        
        for s in range(1, num_sensors + 1):
            sensor_id = f"0F{s:02d}"
            
            if REALISTIC_MODE:
                # Generar valores con más variación y ocasionalmente fuera de rango
                temp = round(random.uniform(TEMP_MIN - 5, TEMP_MAX + 5), 1)
                humedad = random.randint(HUMIDITY_MIN - 10, HUMIDITY_MAX + 10)
            else:
                temp = round(random.uniform(TEMP_MIN, TEMP_MAX), 1)
                humedad = random.randint(HUMIDITY_MIN, HUMIDITY_MAX)
            
            # Determinar estado del sensor basado en valores
            if temp < 10:
                estado = "temp_critical_low"
            elif temp > 38:
                estado = "temp_critical_high"
            elif temp < 18 or temp > 28:
                estado = "temp_out_of_range"
            elif humedad < 25 or humedad > 85:
                estado = "humidity_out_of_range"
            else:
                estado = "ok"
            
            sensores.append({
                "id": sensor_id,
                "posicion": s,
                "temp": temp,
                "humedad": humedad,
                "estado": estado
            })
        
        endpoints.append({
            "id_endpoint": endpoint_id,
            "sensores": sensores
        })
    
    return {
        "id_gateway": gateway_id,
        "endpoints": endpoints
    }


def on_connect(client, userdata, flags, rc):
    """Callback cuando se conecta al broker"""
    if rc == 0:
        print("✅ Conectado al broker MQTT")
    else:
        print(f"❌ Error de conexión: {rc}")


def on_publish(client, userdata, mid):
    """Callback cuando se publica un mensaje"""
    pass  # No necesitamos hacer nada aquí


def main():
    """Función principal"""
    print("=" * 60)
    print("🚀 Simulador MQTT - Testing IoT App")
    print("=" * 60)
    print(f"📡 Broker: {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
    print(f"🔄 Intervalo: 30 segundos")
    print(f"🔢 Gateways: G01-G{NUM_GATEWAYS:02d}")
    print(f"🔢 Endpoints: E01-E{NUM_ENDPOINTS:02d} (por gateway)")
    print(f"🔢 Sensores: 0F01-0F{NUM_SENSORS:02d} (por endpoint)")
    print("=" * 60)
    print()
    
    # Mostrar ejemplo de datos que se enviarán
    print("📋 Ejemplo de datos que se enviarán:")
    print()
    
    # Ejemplo gateway
    print("Tópico: gateway/gateway")
    gateway_example = generate_gateway_data("G01")
    print(json.dumps(gateway_example, indent=2))
    print()
    
    # Ejemplo endpoint
    print("Tópico: gateway/endpoint")
    endpoint_example = generate_endpoint_data("G01", 2)
    print(json.dumps(endpoint_example, indent=2))
    print()
    
    # Ejemplo sensor
    print("Tópico: gateway/sensor")
    sensor_example = generate_sensor_data("G01", 2, 4)
    print(json.dumps(sensor_example, indent=2))
    print()
    print("=" * 60)
    print()
    
    # Crear cliente MQTT
    client = mqtt.Client(client_id="mqtt_simulator", clean_session=True)
    
    # Configurar callbacks
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    # Conectar al broker
    try:
        if MQTT_BROKER_USERNAME and MQTT_BROKER_PASSWORD:
            client.username_pw_set(MQTT_BROKER_USERNAME, MQTT_BROKER_PASSWORD)
        
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
        client.loop_start()
        
        # Esperar a que se conecte
        time.sleep(2)
        
        print("📤 Comenzando a enviar datos...")
        print()
        
        cycle = 1
        while True:
            print(f"⏱️ Ciclo {cycle} - {datetime.now().strftime('%H:%M:%S')}")
            
            # Enviar datos para cada gateway
            for g in range(1, NUM_GATEWAYS + 1):
                gateway_id = f"G{g:02d}"
                
                # 1. Gateway status
                gateway_data = generate_gateway_data(gateway_id)
                client.publish("gateway/gateway", json.dumps(gateway_data), qos=1)
                print(f"  ✓ gateway/gateway → {gateway_id}")
                time.sleep(0.1)
                
                # 2. Endpoints
                endpoint_data = generate_endpoint_data(gateway_id)
                client.publish("gateway/endpoint", json.dumps(endpoint_data), qos=1)
                print(f"  ✓ gateway/endpoint → {gateway_id} ({len(endpoint_data['endpoints'])} endpoints)")
                time.sleep(0.1)
                
                # 3. Sensors
                sensor_data = generate_sensor_data(gateway_id)
                client.publish("gateway/sensor", json.dumps(sensor_data), qos=1)
                
                # Contar total de sensores
                total_sensores = sum(len(ep['sensores']) for ep in sensor_data['endpoints'])
                print(f"  ✓ gateway/sensor → {gateway_id} ({total_sensores} sensores)")
                time.sleep(0.1)
            
            print()
            print(f"✅ Ciclo completo. Esperando 30 segundos...")
            print("-" * 60)
            print()
            
            # Esperar 30 segundos antes del próximo ciclo
            time.sleep(30)
            cycle += 1
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Deteniendo simulador...")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print("👋 Simulador detenido")


if __name__ == "__main__":
    main()

