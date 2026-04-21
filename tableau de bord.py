"""
SmartFarm : Dashboard IoT & IA (Version Python / Streamlit)
Lien GitHub: App connecté via intégration GitHub.
"""
import streamlit as st
import pandas as pd
import numpy as np
import time
from datetime import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title="SmartFarm", page_icon="⚡", layout="wide")

st.title("⚡ SmartFarm : Micro-réseau Intelligent")
st.markdown("Tableau de bord de supervision IoT & IA (Batteries, Énergie, Eau)")

# --- VARIABLES D'ÉTAT ---
if 'battery_soc' not in st.session_state:
    st.session_state.battery_soc = 50.0
if 'soil_moisture' not in st.session_state:
    st.session_state.soil_moisture = 60.0
if 'history' not in st.session_state:
    st.session_state.history = pd.DataFrame(columns=['time', 'production', 'consumption', 'battery', 'moisture'])

# --- MOCK DATA SENSORS ---
def get_sensor_data(weather="Soleil", pump_state=0):
    # Simulation des données capteurs de l'ESP32 via MQTT (mock)
    if weather == "Soleil": prod = np.random.uniform(80, 100)
    elif weather == "Nuages": prod = np.random.uniform(20, 35)
    else: prod = 0
    base_cons = np.random.uniform(15, 20)
    pump_cons = (pump_state / 100) * 60
    return prod, base_cons + pump_cons

# --- INTELLIGENCE ARTIFICIELLE ---
def ai_decision_matrix(battery, moisture, thresholds):
    # Détection demande
    demand = "Normale"
    if moisture < thresholds['low']: demand = "Élevée"
    elif moisture > thresholds['high']: demand = "Faible"
    
    # Matrice
    pump = 0
    decision_text = "Pompage arrêté (Batterie Faible)"
    if battery > 70 and demand == "Normale":
        pump = 100
        decision_text = "Pompage normal (Surplus)"
    elif battery > 30 and demand == "Élevée":
        pump = 50
        decision_text = "Pompage réduit (Stress Hydrique)"
    elif battery < 30 and demand == "Faible":
        pump = 50
        decision_text = "Pompage autorisé (Maintien)"
        
    return pump, decision_text

# --- DASHBOARD UI ---
st.sidebar.header("Paramètres (Simulation)")
weather = st.sidebar.selectbox("Météo Actuelle", ["Soleil", "Nuages", "Nuit"])
threshold_low = st.sidebar.slider("Seuil Humidité Bas", 20, 50, 40)
threshold_high = st.sidebar.slider("Seuil Humidité Haut", 50, 90, 70)

# Exécution Cycle EMS
prod, cons = get_sensor_data(weather, 0)
pump_flow, ai_text = ai_decision_matrix(st.session_state.battery_soc, st.session_state.soil_moisture, {'low': threshold_low, 'high': threshold_high})

# Mise à jour avec la pompe allumée/éteinte
prod, cons = get_sensor_data(weather, pump_flow)

# Update Stockage et Humidité
surplus = prod - cons
st.session_state.battery_soc = max(0, min(100, st.session_state.battery_soc + (surplus * 0.1)))

evap = 2.0 if weather == "Soleil" else 0.5
st.session_state.soil_moisture = max(0, min(100, st.session_state.soil_moisture - evap + (pump_flow/100 * 4)))

# Update History
new_data = pd.DataFrame([{
    'time': datetime.now().strftime("%H:%M:%S"),
    'production': prod, 'consumption': cons, 
    'battery': st.session_state.battery_soc,
    'moisture': st.session_state.soil_moisture
}])
st.session_state.history = pd.concat([st.session_state.history, new_data]).tail(20)

# Affichage Métriques
col1, col2, col3, col4 = st.columns(4)
col1.metric("Production (kW)", f"{prod:.1f}")
col2.metric("Conso. Totale (kW)", f"{cons:.1f}")
col3.metric("Batterie SoC (%)", f"{st.session_state.battery_soc:.1f}")
col4.metric("Humidité Sol (%)", f"{st.session_state.soil_moisture:.1f}")

st.subheader("Décision IA (Energy Management System)")
st.info(f"**Action Pompe :** {pump_flow} L/min ➔ {ai_text}")

st.subheader("Dynamique du Micro-Réseau")
if not st.session_state.history.empty:
    chart_data = st.session_state.history.set_index('time')[['production', 'consumption']]
    st.line_chart(chart_data)
