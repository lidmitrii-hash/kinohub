<template>
  <AppHeader />
  <div class="app">
    <div>


      <div class="flex items-center w-full max-w-4xl mx-auto mt-5 px-4">
        <input

          class="flex-1 bg-white text-black w-full border border-gray-400 rounded-full px-4 py-1 outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          v-model="query"
          placeholder="Поиск фильмов..."
        />
        <button
          class="px-6 py-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition cursor-pointer"
          @click="search"
        >Поиск</button>
      </div>
    </div>



    <!-- Список фильмов -->
    <div class="movies">
      <div
        class="movie-card cursor-pointer"
        v-for="movie in movies"
        :key="movie.id"
        @mouseenter="hovered = movie.id"
        @mouseleave="hovered = null"
        @click="goToMovie(movie.id)"
      >
        <img
          :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'https://via.placeholder.com/200x300?text=Нет+постера'"
          :alt="movie.title"
        />
        <div class="title">{{ movie.title }}</div>
        <div class="date">{{ movie.release_date }}</div>

        <!-- Информация при наведении -->
        <div v-if="hovered === movie.id" class="movie-info">
          <p>Рейтинг: {{ movie.vote_average }}</p>
          <p>Жанр: {{ getGenres(movie.genre_ids) }}</p>
          <p>Дата релиза: {{ movie.release_date }}</p>
        </div>
      </div>
    </div>

<div class="pagination">
  <button @click="prevPage" :disabled="currentPage === 1">Назад</button>
  <span>Страница {{ currentPage }} из {{ totalPages }}</span>
  <button @click="nextPage" :disabled="currentPage === totalPages">Вперед</button>
</div>

  </div>
  <router-view />
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router';
import AppHeader from "../components/icons/AppHeader.vue";

const movies = ref([]);
const hovered = ref(null);
const GENRES = ref({});
const query = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const router = useRouter();
const isSearching = ref(false);
const goToMovie = (id) => {
  if (!id) return;  // защита на случай пустого id
  router.push(`/movie/${id}`);
};





async function search() {
  if (!query.value.trim()) return;

  isSearching.value = true;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${query.value}&language=ru-RU&page=1`,
      options
    );
    const data = await res.json();
    movies.value = data.results;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
  }
}

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YzE2ZGZmNDdkOWY3ZmIyZDJjZTU1ZDJiMjJhOTNlYiIsIm5iZiI6MTc1NTM2NjQ0Ny4xNTUsInN1YiI6IjY4YTBjNDJmM2MzOTdlMWU2YmVkMTNjMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FLX1B8e96ECtZGNFoFnT3Eypenr1pr6iu_6o4aHfnzg";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
};


async function fetchMovies(page = 1) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?language=ru-RU&page=${page}`, options);
    const data = await res.json();
    movies.value = data.results;
    totalPages.value = data.total_pages; // общее количество страниц
    currentPage.value = page;
  } catch (err) {
    console.error(err);
  }
}


function nextPage() {
  if (currentPage.value < totalPages.value) {
    fetchMovies(currentPage.value + 1);
  }
}


function prevPage() {
  if (currentPage.value > 1) {
    fetchMovies(currentPage.value - 1);
  }
}

onMounted(() => {
  fetchMovies();
});

onMounted(async () => {
  query.value = '';
  isSearching.value = false;
  await fetchGenres();
  await fetchMovies();
});
watch(query, async (newValue) => {
  if (!newValue.trim()) {

    isSearching.value = false;
    currentPage.value = 1;
    await fetchMovies(1);
  }
});
async function fetchGenres() {
  try {
    const res = await fetch("https://api.themoviedb.org/3/genre/movie/list?language=ru-RU", options);
    const data = await res.json();
    if (data.genres) {
      data.genres.forEach(g => GENRES.value[g.id] = g.name);
    }
  } catch (err) {
    console.error(err);
  }
}




function getGenres(ids) {
  return ids.map(id => GENRES.value[id]).join(", ");
}


</script>


