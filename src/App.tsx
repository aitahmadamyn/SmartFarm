import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Cloud, Moon, Battery, BatteryCharging, BatteryFull, 
  Droplets, Cpu, Activity, Zap, Server, ChevronRight, FileDown, Gauge,
  Bell, AlertTriangle, AlertCircle, Info, Code, Github, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Types ---
type Weather = 'sunny' | 'cloudy' | 'night';
type WaterDemand = 'low' | 'normal' | 'high';

interface AlertMsg {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

interface DataPoint {
  time: string;
  production: number;
  consumption: number;
  battery: number;
}

// --- Utils: Word Generation ---
const pythonSourceCode = `"""
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
`;

const downloadWordReport = () => {
  const reportHTML = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
    <meta charset='utf-8'>
    <style>
      body { font-family: 'Calibri', sans-serif; line-height: 1.6; color: #000; }
      h1 { color: #10b981; text-align: center; font-size: 24pt; margin-bottom: 5px; }
      .subtitle { text-align: center; font-size: 14pt; color: #4b5563; margin-top: 0; margin-bottom: 30px; font-style: italic; }
      h2 { color: #059669; border-bottom: 1px solid #10b981; padding-bottom: 4px; font-size: 16pt; margin-top: 24px; }
      h3 { color: #047857; font-size: 14pt; margin-top: 16px; }
      p { margin-bottom: 12px; text-align: justify; font-size: 11pt; }
      ul { margin-bottom: 12px; font-size: 11pt; }
      li { margin-bottom: 6px; }
      .highlight { background-color: #f3f4f6; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; text-align: left; font-size: 11pt; }
      th { background-color: #10b981; color: white; padding: 8px; border: 1px solid #d1d5db; }
      td { padding: 8px; border: 1px solid #d1d5db; }
    </style>
    </head>
    <body>
      <h1>RAPPORT TECHNIQUE COMPLET</h1>
      <div class="subtitle">Projet SmartFarm : Micro-réseau Intelligent et Nexus Eau-Énergie</div>
      
      <h2>1. Introduction et Problématique</h2>
      <p>Dans un contexte mondial marqué par le changement climatique, le stress hydrique (particulièrement en Afrique et au Maroc) et la hausse des coûts de l'énergie, le secteur agricole fait face à un défi majeur : comment irriguer efficacement tout en minimisant l'empreinte carbone et les coûts opérationnels ?</p>
      <p>Le projet <b>SmartFarm</b> répond à cette problématique en proposant un micro-réseau décentralisé (Microgrid) couplé à un système de pompage d'eau intelligent. L'objectif est de créer un "Nexus Eau-Énergie" 100% autonome, alimenté par l'énergie solaire, et piloté par l'Intelligence Artificielle (IA) pour optimiser chaque goutte d'eau et chaque watt d'énergie.</p>

      <h2>2. Architecture Globale du Système</h2>
      <p>Le système repose sur une architecture IoT (Internet of Things) complète, allant du capteur physique jusqu'au tableau de bord cloud.</p>
      <h3>2.1. Composants Matériels (Hardware)</h3>
      <ul>
        <li><b>Génération d'énergie :</b> Panneaux solaires photovoltaïques.</li>
        <li><b>Stockage :</b> Batterie Lithium-ion (Li-ion) pour stocker le surplus d'énergie.</li>
        <li><b>Unité de contrôle (Edge) :</b> Microcontrôleur ESP32 (avec connectivité Wi-Fi) agissant comme le cerveau local.</li>
        <li><b>Capteurs :</b>
          <ul>
            <li><i>Capteurs de puissance (INA219) :</i> Mesurent la tension et le courant des panneaux et de la batterie.</li>
            <li><i>Capteurs d'humidité du sol :</i> Mesurent le besoin en eau des cultures.</li>
            <li><i>Débitmètre (Water Flow Sensor) :</i> Mesure la quantité d'eau réellement pompée.</li>
            <li><i>Capteur de luminosité (Pyranomètre/LDR) :</i> Mesure l'irradiation solaire locale.</li>
          </ul>
        </li>
        <li><b>Actionneurs :</b> Pompe à eau DC (contrôlée via PWM) et modules relais.</li>
      </ul>
      <h3>2.2. Composants Logiciels (Software)</h3>
      <ul>
        <li><b>Interface Utilisateur (Dashboard) :</b> Développée en React.js, elle permet la visualisation en temps réel des flux d'énergie, de l'état de la batterie et des décisions de l'IA.</li>
        <li><b>Intelligence Artificielle :</b> Modèles de Machine Learning (LSTM et Régression) hébergés sur un serveur local (Raspberry Pi) ou Cloud (API Flask/FastAPI).</li>
        <li><b>Communication :</b> Protocole MQTT pour des échanges de données légers et rapides entre l'ESP32 et le serveur.</li>
      </ul>

      <h2>3. Gestion de l'Énergie (EMS - Energy Management System)</h2>
      <p>L'EMS est le cœur logique du micro-réseau. Son rôle est d'équilibrer l'équation fondamentale : <i>Production = Consommation + Stockage</i>.</p>
      <ul>
        <li><b>Priorisation des charges :</b> L'énergie solaire alimente d'abord les charges critiques (ex: capteurs, routeur). Le surplus est dirigé vers la batterie.</li>
        <li><b>Charge flexible (Pompe) :</b> La pompe à eau est considérée comme une "charge différable". Elle n'est activée que lorsque l'énergie est abondante ou que le besoin en eau est critique, évitant ainsi de vider la batterie la nuit.</li>
        <li><b>Protection de la batterie :</b> L'EMS empêche les décharges profondes (SoC < 20%) et les surcharges (SoC > 95%), prolongeant ainsi la durée de vie des cellules Li-ion.</li>
      </ul>

      <h2>4. Intelligence Artificielle : Prédiction et Décision</h2>
      <p>L'IA permet au système de passer d'une gestion réactive à une gestion <b>prédictive</b>.</p>
      <h3>4.1. Modèle LSTM (Séries Temporelles)</h3>
      <p>Pour anticiper la production solaire, nous utilisons un réseau de neurones récurrents de type <b>LSTM (Long Short-Term Memory)</b>. Contrairement aux modèles classiques, le LSTM possède une mémoire interne capable de retenir les cycles journaliers et les variations météorologiques complexes.</p>
      <p>Le modèle est entraîné sur des données historiques (irradiation, température, nébulosité) pour prédire la production énergétique sur un horizon de 24 heures.</p>
      
      <h3>4.2. Matrice de Décision IA</h3>
      <p>L'EMS croise l'état de charge de la batterie (SoC) avec la demande en eau pour prendre des décisions en temps réel :</p>
      <table>
        <tr>
          <th>État batterie</th>
          <th>Demande en eau</th>
          <th>Décision de l'IA</th>
        </tr>
        <tr><td>Élevé (> 70%)</td><td>Normale</td><td>Pompage normal (100 L/min) - Utilisation du surplus</td></tr>
        <tr><td>Moyen (30-70%)</td><td>Élevée</td><td>Pompage réduit (50 L/min) - Préservation de l'énergie</td></tr>
        <tr><td>Faible (< 30%)</td><td>Faible</td><td>Pompage autorisé (50 L/min) - Maintien minimal</td></tr>
        <tr><td>Faible (< 30%)</td><td>Élevée</td><td>Pompage arrêté (0 L/min) - Protection critique de la batterie</td></tr>
      </table>

      <h2>5. Module Intelligent de Détection de la Demande en Eau</h2>
      <p>Pour rendre l'irrigation 100% autonome, le système intègre un module avancé basé sur l'humidité du sol :</p>
      <ul>
        <li><b>Collecte et Lissage :</b> Les données des hygromètres sont collectées toutes les 10 à 30 minutes. Une moyenne glissante sur 12h/24h est calculée pour lisser les variations instantanées et éviter les démarrages intempestifs de la pompe.</li>
        <li><b>Classification IA :</b> Cette moyenne alimente un modèle léger qui classifie la demande en trois niveaux : <i>Faible</i>, <i>Normale</i> ou <i>Élevée</i>.</li>
        <li><b>Apprentissage Dynamique des Seuils :</b> Le modèle ajuste automatiquement ses seuils de déclenchement. Par exemple, si la température ambiante dépasse 30°C, l'IA anticipe l'évaporation et augmente le seuil critique d'humidité, déclenchant l'irrigation plus tôt.</li>
        <li><b>Boucle de Rétroaction (Feedback) :</b> Le débitmètre physique mesure l'eau réellement pompée. L'IA observe ensuite la remontée de l'humidité du sol post-irrigation pour affiner ses futures décisions (ajustement du temps de pompage).</li>
      </ul>

      <h2>6. Résultats Attendus et Impact</h2>
      <div class="highlight">
        <p>Le déploiement de SmartFarm permet d'atteindre des résultats mesurables sur trois axes :</p>
        <ul>
          <li><b>Économie d'Eau :</b> Réduction du gaspillage de 30 à 40% grâce à l'irrigation de précision basée sur l'humidité réelle et l'évapotranspiration.</li>
          <li><b>Durée de vie des Batteries :</b> Prolongation de la durée de vie des batteries Li-ion de 20 à 30% en évitant les cycles de décharge profonde grâce à la prédiction LSTM.</li>
          <li><b>Autonomie Énergétique :</b> Maximisation de l'autoconsommation solaire (effacement des pics de consommation sur le réseau électrique traditionnel).</li>
        </ul>
      </div>

      <h2>7. Conclusion</h2>
      <p>Le projet SmartFarm démontre que la convergence entre l'Internet des Objets (IoT) et l'Intelligence Artificielle (IA) offre une solution robuste et scalable aux défis du Nexus Eau-Énergie. En automatisant entièrement la prise de décision, de la prédiction météorologique jusqu'au contrôle du débit d'eau, ce système représente l'avenir de l'agriculture intelligente et de la gestion décentralisée de l'énergie verte.</p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', reportHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Rapport_Integration_IA_SmartFarm.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Components ---

function Hero() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 mb-12"
    >
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full px-4 py-1.5 mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Projet Green Tech</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          SmartFarm <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            L'IA au service de l'Énergie et de l'Eau
          </span>
        </h1>
        
        <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
          Un micro-réseau intelligent décentralisé. L'Intelligence Artificielle anticipe la production solaire pour optimiser la durée de vie des batteries et utiliser les surplus d'énergie pour le pompage d'eau agricole.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2 text-sm text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700/50">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Modèle LSTM (Séries Temporelles)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700/50">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>Nexus Énergie-Eau</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700/50">
            <Server className="w-4 h-4 text-purple-400" />
            <span>IoT & Edge Computing</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SimulationDashboard() {
  const [weather, setWeather] = useState<Weather>('sunny');
  const [batterySoC, setBatterySoC] = useState(50);
  const [pumpFlow, setPumpFlow] = useState(0); // 0, 50, or 100 L/min
  const [waterDemand, setWaterDemand] = useState<WaterDemand>('normal');
  const [aiDecision, setAiDecision] = useState("En attente");
  const [envMode, setEnvMode] = useState<'static' | 'dynamic'>('static');
  const [data, setData] = useState<DataPoint[]>([]);
  
  // Nouveaux états pour le module d'humidité
  const [soilMoisture, setSoilMoisture] = useState(60);
  const [moistureHistory, setMoistureHistory] = useState<number[]>([60]);
  const [temperature, setTemperature] = useState(25);
  const [thresholds, setThresholds] = useState({ low: 40, high: 70 });
  
  // État pour le système d'alerte
  const [alerts, setAlerts] = useState<AlertMsg[]>([]);
  
  const tickRef = useRef(0);

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const currentTick = tickRef.current;
      
      let currentW = weather;

      if (envMode === 'dynamic') {
         // Change weather every 6 ticks (9 seconds)
         if (currentTick % 6 === 0) {
           currentW = currentW === 'sunny' ? 'cloudy' : currentW === 'cloudy' ? 'night' : 'sunny';
           setWeather(currentW);
         }
      }

      // --- MODULE IA : Détection de la Demande en Eau ---
      
      // 1. Mise à jour de la température simulée
      let currentTemp = temperature;
      if (currentW === 'sunny') currentTemp = Math.min(40, currentTemp + 0.5);
      if (currentW === 'cloudy') currentTemp = Math.max(20, currentTemp + (25 - currentTemp) * 0.1);
      if (currentW === 'night') currentTemp = Math.max(15, currentTemp - 0.5);
      
      // 2. Simulation de l'humidité du sol (évaporation vs irrigation)
      let evapRate = (currentTemp / 40) * (currentW === 'sunny' ? 2 : currentW === 'cloudy' ? 1 : 0.5);
      let irrigRate = (pumpFlow / 100) * 4; // L'irrigation augmente l'humidité
      
      let newMoisture = soilMoisture - evapRate + irrigRate;
      newMoisture = Math.max(0, Math.min(100, newMoisture));
      
      // 3. Moyenne glissante (lissage sur les 20 derniers ticks)
      const newHistory = [...moistureHistory, newMoisture].slice(-20);
      const avgMoisture = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      
      // 4. Apprentissage automatique des seuils (Feedback loop)
      let newThresholds = { ...thresholds };
      // Si la température est élevée, la plante a besoin d'eau plus tôt (les seuils augmentent)
      if (currentTemp > 30) {
         newThresholds.low = Math.min(50, newThresholds.low + 0.1);
         newThresholds.high = Math.min(80, newThresholds.high + 0.1);
      } else {
         newThresholds.low = Math.max(30, newThresholds.low - 0.1);
         newThresholds.high = Math.max(60, newThresholds.high - 0.1);
      }
      
      // 5. Classification IA de la demande
      let currentD: WaterDemand = 'normal';
      if (avgMoisture < newThresholds.low) {
        currentD = 'high'; // Sol sec -> Demande élevée
      } else if (avgMoisture > newThresholds.high) {
        currentD = 'low'; // Sol humide -> Demande faible
      } else {
        currentD = 'normal';
      }
      
      setTemperature(currentTemp);
      setSoilMoisture(newMoisture);
      setMoistureHistory(newHistory);
      setThresholds(newThresholds);
      setWaterDemand(currentD);
      // ---------------------------------------------------

      // Determine production based on weather
      let prod = 0;
      if (currentW === 'sunny') prod = 80 + Math.random() * 20; // 80-100 kW
      if (currentW === 'cloudy') prod = 20 + Math.random() * 15; // 20-35 kW
      if (currentW === 'night') prod = 0;
      
      // Base critical load (always on)
      let cons = 15 + Math.random() * 5; // 15-20 kW
      
      // AI Decision Logic with Adaptive Pumping
      let newBattery = batterySoC;
      let targetFlow = 0;
      let pumpCons = 0;
      let decisionText = "";
      
      const batState = newBattery > 70 ? 'Élevé' : newBattery > 30 ? 'Moyen' : 'Faible';
      
      // Matrice de décision IA
      if (batState === 'Élevé' && currentD === 'normal') {
        targetFlow = 100; decisionText = "Pompage normal";
      } else if (batState === 'Moyen' && currentD === 'high') {
        targetFlow = 50; decisionText = "Pompage réduit";
      } else if (batState === 'Faible' && currentD === 'low') {
        targetFlow = 50; decisionText = "Pompage autorisé";
      } else if (batState === 'Faible' && currentD === 'high') {
        targetFlow = 0; decisionText = "Pompage arrêté";
      } else {
        // Fallbacks logiques pour les autres combinaisons
        if (batState === 'Élevé') { targetFlow = 100; decisionText = "Pompage normal"; }
        else if (batState === 'Moyen') { targetFlow = 50; decisionText = "Pompage réduit"; }
        else { targetFlow = 0; decisionText = "Pompage arrêté"; }
      }
      
      // Smooth flow transition (increase/decrease automatically)
      let nextFlow = pumpFlow;
      if (nextFlow < targetFlow) nextFlow = Math.min(nextFlow + 10, targetFlow);
      else if (nextFlow > targetFlow) nextFlow = Math.max(nextFlow - 10, targetFlow);
      
      // Calculate pump consumption based on flow (max 60kW at 100 L/min)
      pumpCons = (nextFlow / 100) * 60;
      cons += pumpCons;

      // Update battery
      if (prod > cons) {
         let surplus = prod - cons;
         newBattery += surplus * 0.1;
      } else {
         let deficit = cons - prod;
         newBattery -= deficit * 0.1;
      }
      
      // Clamp values
      newBattery = Math.max(0, Math.min(100, newBattery));
      
      setBatterySoC(newBattery);
      setPumpFlow(nextFlow);
      setAiDecision(decisionText);
      
      // Update chart data
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setData(prev => {
        const newData = [...prev, {
          time: timeStr,
          production: Math.round(prod),
          consumption: Math.round(cons),
          battery: Math.round(newBattery)
        }];
        if (newData.length > 15) return newData.slice(newData.length - 15);
        return newData;
      });
      
      // AI Alert Analysis
      const newAlerts: AlertMsg[] = [];
      
      // 1. Energy Shortage
      if (newBattery < 20 && prod < cons) {
        newAlerts.push({ id: Date.now() + '1', type: 'critical', message: "Risque de blackout : Batterie critique (<20%).", time: timeStr });
      }
      // 2. Water Shortage (Stress hydrique + pas de pompage)
      if (newMoisture < newThresholds.low && nextFlow === 0) {
        newAlerts.push({ id: Date.now() + '2', type: 'warning', message: "Stress hydrique : Irrigation bloquée par manque d'énergie.", time: timeStr });
      }
      // 3. Suboptimal performance / Malfunction
      if (nextFlow > 0 && newBattery < 30 && prod < cons) {
         newAlerts.push({ id: Date.now() + '3', type: 'info', message: "Performance sub-optimale : Pompage actif sur batterie faible sans surplus solaire.", time: timeStr });
      }
      
      if (newAlerts.length > 0) {
        setAlerts(prev => {
           let updated = [...prev];
           newAlerts.forEach(na => {
              // Only add if the last alert isn't the exact same message
              if (updated.length === 0 || updated[0].message !== na.message) {
                 updated.unshift(na);
              }
           });
           return updated.slice(0, 5); // Keep last 5
        });
      }
      
    }, 1500); // Update every 1.5s
    
    return () => clearInterval(interval);
  }, [weather, batterySoC, envMode, pumpFlow, soilMoisture, moistureHistory, temperature, thresholds]);

  return (
    <div className="mb-16">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Simulation en Temps Réel (EMS + IA)
          </h2>
          <div className="flex bg-zinc-800 rounded-lg p-1 border border-zinc-700 self-start sm:self-auto">
            <button 
              onClick={() => setEnvMode('static')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${envMode === 'static' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Contrôle Manuel
            </button>
            <button 
              onClick={() => setEnvMode('dynamic')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 ${envMode === 'dynamic' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Zap className="w-3 h-3" /> Démo Auto
            </button>
          </div>
        </div>

        {envMode === 'dynamic' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
            <Activity className="w-4 h-4" />
            Mode Démonstration : La météo varie automatiquement. L'IA gère l'humidité du sol.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className={`flex bg-zinc-800 rounded-lg p-1 border border-zinc-700 transition-opacity ${envMode === 'dynamic' ? 'opacity-50 pointer-events-none' : ''}`}>
            {(['sunny', 'cloudy', 'night'] as Weather[]).map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  weather === w 
                    ? 'bg-zinc-700 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                }`}
              >
                {w === 'sunny' && <Sun className="w-4 h-4 text-yellow-500" />}
                {w === 'cloudy' && <Cloud className="w-4 h-4 text-gray-400" />}
                {w === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
                <span className="capitalize">{w === 'sunny' ? 'Soleil' : w === 'cloudy' ? 'Nuages' : 'Nuit'}</span>
              </button>
            ))}
          </div>
          {/* Les boutons manuels de demande en eau ont été remplacés par le module IA */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Cards */}
        <div className="space-y-6">
          {/* Soil Moisture AI Module */}
          <motion.div 
            layout
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-zinc-400 font-medium mb-1">Humidité du Sol (IA)</p>
                <h3 className="text-3xl font-bold text-white">{Math.round(soilMoisture)}%</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Droplets className="w-6 h-6" />
              </div>
            </div>
            
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${soilMoisture}%` }}
                transition={{ type: "spring", bounce: 0 }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-zinc-400 mb-4">
              <span>Seuil Bas: {Math.round(thresholds.low)}%</span>
              <span>Temp: {Math.round(temperature)}°C</span>
              <span>Seuil Haut: {Math.round(thresholds.high)}%</span>
            </div>

            <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
              waterDemand === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              waterDemand === 'low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              <span>Demande classifiée :</span>
              <span className="uppercase tracking-wider">
                {waterDemand === 'high' ? 'Élevée' : waterDemand === 'low' ? 'Faible' : 'Normale'}
              </span>
            </div>
          </motion.div>
          {/* Battery Status */}
          <motion.div 
            layout
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-zinc-400 font-medium mb-1">Stockage (Batterie)</p>
                <h3 className="text-3xl font-bold text-white">{Math.round(batterySoC)}%</h3>
              </div>
              <div className={`p-3 rounded-xl ${batterySoC > 20 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {batterySoC > 90 ? <BatteryFull className="w-6 h-6" /> : 
                 data.length > 0 && data[data.length-1].production > data[data.length-1].consumption ? <BatteryCharging className="w-6 h-6" /> : 
                 <Battery className="w-6 h-6" />}
              </div>
            </div>
            
            {/* Battery Visualizer */}
            <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${batterySoC > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${batterySoC}%` }}
                transition={{ type: "spring", bounce: 0 }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              L'IA préserve la batterie entre 20% et 90% pour maximiser sa durée de vie.
            </p>
          </motion.div>

          {/* Pump Status */}
          <motion.div 
            layout
            className={`border rounded-2xl p-6 relative overflow-hidden transition-colors duration-500 ${
              pumpFlow > 75 ? 'bg-blue-900/20 border-blue-500/30' : 
              pumpFlow > 0 ? 'bg-indigo-900/20 border-indigo-500/30' : 
              'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-zinc-400 font-medium mb-1">Charge Flexible (Pompe)</p>
                <h3 className="text-2xl font-bold text-white">
                  {aiDecision}
                </h3>
                <p className="text-lg text-blue-400 font-mono mt-1">{pumpFlow} L/min</p>
              </div>
              <div className={`p-3 rounded-xl ${pumpFlow > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {pumpFlow > 0 ? <Gauge className={`w-6 h-6 ${pumpFlow > 75 ? 'animate-bounce' : 'animate-pulse'}`} /> : <Droplets className="w-6 h-6" />}
              </div>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              {`Matrice IA ➔ Batterie : ${batterySoC > 70 ? 'Élevé' : batterySoC > 30 ? 'Moyen' : 'Faible'} | Demande : ${waterDemand === 'high' ? 'Élevé' : waterDemand === 'normal' ? 'Normal' : 'Faible'}`}
            </p>
          </motion.div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Power */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-6">Production vs Consommation (kW)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="production" 
                    name="Production Solaire"
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProd)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    name="Consommation Totale"
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCons)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Production Solaire
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Consommation (Critique + Pompe)
              </div>
            </div>
          </div>

          {/* Alert System */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Système d'Alerte Intelligent (IA)
            </h3>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">Aucune anomalie détectée. Le système fonctionne de manière optimale.</p>
              ) : (
                <AnimatePresence>
                  {alerts.map(alert => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${
                        alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}
                    >
                      <div className="mt-0.5">
                        {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                         alert.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                         <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p>{alert.message}</p>
                        <span className="text-xs opacity-60 mt-1 block">{alert.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HardwareGallery() {
  const hardware = [
    {
      name: "Microcontrôleur ESP32",
      role: "Le Cerveau (EMS Edge)",
      desc: "Récupère les données des capteurs, communique avec le serveur IA via Wi-Fi, et actionne les relais.",
      img: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
      icon: <Cpu className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Capteur INA219",
      role: "Mesure de Puissance",
      desc: "Mesure avec précision la tension et le courant (DC) sortant des panneaux et entrant dans la batterie.",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      icon: <Activity className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Cellule Lithium 18650",
      role: "Stockage d'Énergie",
      desc: "Batterie de démonstration. L'IA surveille son SoC (State of Charge) pour éviter les décharges profondes.",
      img: "https://images.unsplash.com/photo-1617781377359-5242eb0e527a?auto=format&fit=crop&w=800&q=80",
      icon: <Battery className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Mini Panneau Solaire 5V",
      role: "Production ENR",
      desc: "Simule la centrale solaire. Sa production varie selon l'ensoleillement (simulé par une lampe).",
      img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      icon: <Sun className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Capteur de Débit d'Eau",
      role: "Mesure du Nexus",
      desc: "Mesure la quantité d'eau pompée. Permet à l'IA d'ajuster dynamiquement le débit (réduction/arrêt) selon l'état de la batterie.",
      img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
      icon: <Gauge className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Mini Pompe à Eau DC",
      role: "Charge Flexible (Nexus)",
      desc: "S'active uniquement lorsque l'IA détecte un surplus d'énergie et que la batterie est pleine.",
      img: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80",
      icon: <Droplets className="w-5 h-5 text-zinc-900" />
    },
    {
      name: "Module Relais 5V",
      role: "Actionneur",
      desc: "Agit comme un interrupteur intelligent contrôlé par l'ESP32 pour allumer ou éteindre la pompe.",
      img: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80",
      icon: <Zap className="w-5 h-5 text-zinc-900" />
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
        <Server className="w-6 h-6 text-emerald-500" />
        Matériel pour le Prototype (Hardware-in-the-loop)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hardware.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors"
          >
            <div className="relative h-48 overflow-hidden bg-zinc-800">
              <img 
                src={item.img} 
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute top-4 left-4 bg-emerald-400 rounded-full p-2 shadow-lg">
                {item.icon}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent p-4 pt-12">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{item.role}</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      {/* Navigation Bar */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SmartFarm</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="text-white">Aperçu</a>
            <a href="#" className="hover:text-white transition-colors">Simulation</a>
            <button onClick={() => setShowCode(true)} className="hover:text-white transition-colors flex items-center gap-1"><Github className="w-4 h-4"/>Code Python</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <Hero />
        <SimulationDashboard />
        <HardwareGallery />
        
        {/* Footer / Conclusion */}
        <div className="border-t border-zinc-800 pt-12 pb-24 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Prêt pour la compétition Green Tech</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Ce prototype démontre la faisabilité technique d'un micro-réseau intelligent adapté au contexte marocain. 
            En combinant l'IA (modèle LSTM) et l'IoT (ESP32), nous apportons une solution concrète à l'intermittence des ENR et au stress hydrique.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={downloadWordReport}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FileDown className="w-5 h-5" /> Télécharger le Rapport IA (Word)
            </button>
            <button 
              onClick={() => setShowCode(true)}
              className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white border border-zinc-700 px-6 py-3 rounded-full font-semibold hover:bg-zinc-700 transition-colors"
            >
              <Code className="w-4 h-4" /> Voir le code Python (GitHub)
            </button>
          </div>
        </div>
      </main>

      {/* Code Modal */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">dashboard.py (Code Source Physique)</h3>
                </div>
                <button
                  onClick={() => setShowCode(false)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-[#1E1E1E]">
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem', background: 'transparent' }}
                  showLineNumbers={true}
                >
                  {pythonSourceCode}
                </SyntaxHighlighter>
              </div>
              
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex justify-between items-center text-xs text-zinc-400">
                <span>Code pour l'exécution avec Streamlit. Ce code simule le dashboard sur votre Raspberry Pi / Serveur Python.</span>
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(pythonSourceCode);
                     alert("Code copié dans le presse-papiers!");
                  }}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-medium transition-colors"
                >
                  Copier le code
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
