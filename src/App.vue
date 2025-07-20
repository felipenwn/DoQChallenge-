<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// --- ESTADO DA APLICAÇÃO (STATE) ---
const searchQuery = ref('');
// Insira sua chave da API do OpenWeatherMap aqui!
const apiKey = ref('edf1e9a43485264e901d6c0ece14599b'); 
const weatherData = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// --- LÓGICA DA API ---
const getWeather = async () => {
  if (searchQuery.value.trim() === '') {
    error.value = 'Por favor, digite o nome de uma cidade.';
    return;
  }

  loading.value = true;
  error.value = null;
  weatherData.value = null;

  try {
    // Usamos a API de 'forecast' pois ela já inclui dados atuais e previsão
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${searchQuery.value}&appid=${apiKey.value}&units=metric&lang=pt_br`;
    const response = await axios.get(url);
    weatherData.value = response.data;
  } catch (err) {
    error.value = 'Não foi possível encontrar a cidade. Verifique o nome e tente novamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- DADOS COMPUTADOS (COMPUTED) ---
// Extrai os dados do tempo atual do primeiro item da lista de previsão
const currentWeather = computed(() => {
  if (!weatherData.value) return null;
  const current = weatherData.value.list[0];
  return {
    temp: current.main.temp,
    feels_like: current.main.feels_like,
    humidity: current.main.humidity,
    wind: current.wind.speed,
    description: current.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`,
  };
});

// Filtra a lista de previsão para mostrar apenas um item por dia (o do meio-dia)
const dailyForecast = computed(() => {
  if (!weatherData.value) return [];
  const daily: any[] = [];
  const seenDays = new Set(); // Para garantir que cada dia apareça apenas uma vez

  for (const item of weatherData.value.list) {
    const day = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'long' });
    if (!seenDays.has(day)) {
      daily.push(item);
      seenDays.add(day);
    }
  }
  return daily.slice(1, 6); // Retorna os próximos 5 dias
});

// Prepara os dados para o gráfico
const chartData = computed(() => {
  if (!dailyForecast.value.length) {
    return { labels: [], datasets: [] };
  }
  return {
    labels: dailyForecast.value.map(item => new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' })),
    datasets: [
      {
        label: 'Temperatura (°C)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        borderRadius: 4,
        data: dailyForecast.value.map(item => item.main.temp),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#000',
      titleFont: { size: 16 },
      bodyFont: { size: 14 },
      padding: 10,
    },
  },
  scales: {
    x: {
      ticks: { color: '#fff', font: { weight: 'bold' as const } },
      grid: { display: false },
    },
    y: {
      ticks: { color: '#fff' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
    },
  },
};

</script>

<template>
  <div class="weather-app">
    <main class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <h1 class="text-center text-white mb-4 fw-bold">Previsão do Tempo</h1>
          <form @submit.prevent="getWeather">
            <div class="input-group shadow-lg">
              <input 
                type="text" 
                class="form-control form-control-lg" 
                placeholder="Digite o nome de uma cidade..." 
                v-model="searchQuery"
              >
              <button class="btn btn-primary" type="submit">
                <i class="bi bi-search"></i> Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="loading" class="text-center text-white mt-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger mt-4 shadow-sm" role="alert">
        {{ error }}
      </div>

      <div v-if="weatherData && !error" class="mt-5">
        <div class="card current-weather-card text-white shadow-lg mb-5">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h2 class="card-title fw-bold">{{ weatherData.city.name }}, {{ weatherData.city.country }}</h2>
                <p class="lead text-capitalize">{{ currentWeather?.description }}</p>
                <h3 class="display-3 fw-bold">{{ Math.round(currentWeather?.temp ?? 0) }}°C</h3>
                <p>Sensação térmica: {{ Math.round(currentWeather?.feels_like ?? 0) }}°C</p>
              </div>
              <div class="col-md-4 text-center">
                <img :src="currentWeather?.icon" alt="Ícone do tempo" class="weather-icon">
              </div>
            </div>
          </div>
        </div>
        
        <h3 class="text-white mb-4">Próximos 5 dias</h3>
        <div class="row">
          <div v-for="item in dailyForecast" :key="item.dt" class="col-lg col-md-4 col-6 mb-4">
            <div class="card forecast-card text-white text-center shadow">
              <div class="card-body">
                <h5 class="card-title text-capitalize">{{ new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' }) }}</h5>
                <img :src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`" alt="">
                <p class="fw-bold fs-4 mb-0">{{ Math.round(item.main.temp) }}°C</p>
                <p class="text-white-50 text-capitalize">{{ item.weather[0].description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card chart-card text-white shadow-lg mt-4">
          <div class="card-body">
             <h4 class="card-title mb-4">Variação da Temperatura</h4>
             <div style="height: 300px">
                <Bar :data="chartData" :options="chartOptions" />
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Usamos uma tag de estilo global (sem 'scoped') para estilizar o fundo */
:root {
  --background-start-color: #2c3e50;
  --background-end-color: #3498db;
  --card-background-color: rgba(255, 255, 255, 0.1);
  --card-border-color: rgba(255, 255, 255, 0.2);
}

body, html {
  height: 100%;
  margin: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.weather-app {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background-start-color), var(--background-end-color));
  color: #fff;
}

.card {
  border: 1px solid var(--card-border-color);
  background-color: transparent;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.current-weather-card {
  background-color: var(--card-background-color);
  border-radius: 1.5rem;
}

.weather-icon {
  width: 150px;
  height: 150px;
}

.forecast-card {
  background-color: var(--card-background-color);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border-radius: 1rem;
}

.forecast-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.chart-card {
   background-color: var(--card-background-color);
   border-radius: 1.5rem;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}
</style>