<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
const searchQuery = ref('');
const weatherData = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const searchWeather = async () => {
const apiKey = 'edf1e9a43485264e901d6c0ece14599b';
const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery.value}&appid=${apiKey}&units=metric&lang=pt_br`;
  loading.value = true;
  weatherData.value = null;
  error.value = null;

   try {
    const response = await axios.get(url);
    weatherData.value = response.data;
  } catch (err) {
    error.value = 'Cidade não encontrada. Tente novamente.';
    console.error('Erro ao buscar dados do tempo:', err);
  } finally {
    loading.value = false;
  }
    
}


</script>

<template>
  <header>

  </header>

  <main>
<input type="text" placeholder="Search for a city..." v-model="searchQuery" />
    <button @click="searchWeather">Search</button>
    <div v-if="weatherData">
      <h2>{{ weatherData.name }}</h2>
      <p>Temperature: {{ weatherData.main.temp }}°C</p>
      <p>Weather: {{ weatherData.weather[0].description }}</p>
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
