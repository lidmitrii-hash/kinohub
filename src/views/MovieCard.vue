<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '../components/icons/AppHeader.vue';
import api from '@/api/tmdb';

const route = useRoute();
const router = useRouter();
const movie = ref(null);
const error = ref(false);
const similarMovies = ref([]);
const sliderIndex = ref(0);
const VISIBLE_COUNT = 5;
const hoveredMovieId = ref(null);
const GENRES = ref({});

const loadMovie = async (movieId) => {
  try {
    error.value = false;
    movie.value = null;

    await fetchSimilarMovies(movieId);

    const res = await api.get(`/movie/${movieId}`);
    movie.value = res.data;
  } catch (err) {
    console.error('Ошибка при загрузке фильма:', err);
    error.value = true;
  }
};

const getGenres = (ids = []) =>
  ids.map(id => GENRES.value[id]).filter(Boolean).join(', ');

const fetchGenres = async () => {
  try {
    const res = await api.get('/genre/movie/list?language=ru-RU');
    res.data.genres.forEach(g => {
      GENRES.value[g.id] = g.name;
    });
  } catch (e) {
    console.error('Ошибка загрузки жанров', e);
  }
};

const fetchSimilarMovies = async (id) => {
  try {
    const res = await api.get(`/movie/${id}/similar`);
    similarMovies.value = res.data.results;
  } catch (e) {
    console.error('Ошибка загрузки похожих фильмов', e);
  }
};

const nextSlide = () => {
  if (sliderIndex.value + VISIBLE_COUNT < similarMovies.value.length) {
    sliderIndex.value++;
  }
};

const prevSlide = () => {
  if (sliderIndex.value > 0) {
    sliderIndex.value--;
  }
};

const visibleMovies = computed(() =>
  similarMovies.value.slice(
    sliderIndex.value,
    sliderIndex.value + VISIBLE_COUNT
  )
);

const posterUrl = computed(() =>
  movie.value?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.value.poster_path}`
    : ''
);

const formatMoney = (value) => (!value ? '—' : '$' + value.toLocaleString());

onMounted(async () => {
  const movieId = route.params.id;
  await fetchSimilarMovies(movieId);
  await fetchGenres();
  if (!movieId) {
    console.warn('ID фильма не указан, редирект на главную');
    error.value = true;
    router.push('/');
    return;
  }

  try {
    const res = await api.get(`/movie/${movieId}`);
    movie.value = res.data;
  } catch (err) {
    console.error('Ошибка при загрузке фильма:', err);
    error.value = true;
  }
  await loadMovie(movieId);
});
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadMovie(newId);
    }
  }
);
</script>



<template>
  <AppHeader />

  <div v-if="error" class="text-center mt-10 text-xl text-red-500">
    Фильм не найден или ID не указан в маршруте.
  </div>

  <div
    v-if="movie"
    class="movie-page bg-radial-[at_25%_25%] from-blue to-zinc-900 to-75% w-3/5 m-auto min-h-screen mt-6 h-full"
  >
      <div class="flex gap-8 items-start">
    <img
      v-if="movie.poster_path"
      :src="posterUrl"
      class="w-64 h-96 rounded-lg pt-3 pl-3"
      alt="poster"
    />



    <div class="text-wrap movie-details mt-4 space-y-2">
    <h1 class="text-2xl font-bold mr-85 truncate max-w-[600px]">{{ movie.title }}</h1>
      <p><strong>Дата релиза:</strong> {{ movie.release_date }}</p>

      <p><strong>Страна:</strong>
        {{ movie.production_countries?.[0]?.name || '—' }}
      </p>

      <p><strong>Слоган:</strong>
        {{ movie.tagline || '—' }}
      </p>

      <p><strong>Жанры:</strong>
        {{ movie.genres.map(g => g.name).join(', ') }}
      </p>

      <p><strong>Бюджет:</strong>
        {{ formatMoney(movie.budget) }}
      </p>

      <p><strong>Время:</strong>
        {{ movie.runtime }} мин.
      </p>

      <p class="mt-16 max-w-[600px] break-words leading-relaxed"><strong>Описание:</strong>
        {{ movie.overview || '—' }}</p>
    </div>
    </div>
    <!-- Похожие фильмы -->
<div v-if="similarMovies.length" class="mt-12 ml-9">
  <h2 class="text-2xl font-bold mb-4">Похожие фильмы</h2>

  <div class="relative flex items-center">
    <!-- Левая стрелка -->
    <button
      @click="prevSlide"
      :disabled="sliderIndex === 0"
      class="absolute -left-9 z-10 bg-black/70 hover:bg-black rounded-full p-3 cursor-pointer"
    >
      ◀
    </button>

    <!-- Слайдер -->
    <div
  v-for="movie in visibleMovies"
  :key="movie.id"
  class="relative w-40 m-1 shrink-0 cursor-pointer"
  @mouseenter="hoveredMovieId = movie.id"
  @mouseleave="hoveredMovieId = null"
  @click="router.push(`/movie/${movie.id}`)"
>
  <img
    :src="movie.poster_path
      ? 'https://image.tmdb.org/t/p/w300' + movie.poster_path
      : 'https://via.placeholder.com/300x450?text=No+Image'"
    class="rounded-lg"
  />

  <!-- Hover info -->
  <div
    v-if="hoveredMovieId === movie.id"
    class="absolute inset-0 bg-black/80 text-white p-2 text-xs flex flex-col justify-end rounded-lg"
  >
    <p class="font-bold">{{ movie.title }}</p>
    <p>⭐ {{ movie.vote_average }}</p>
    <p>{{ getGenres(movie.genre_ids) }}</p>
    <p>{{ movie.release_date }}</p>
  </div>
</div>

    <!-- Правая стрелка -->
    <button
      @click="nextSlide"
      :disabled="sliderIndex + VISIBLE_COUNT >= similarMovies.length"
      class="absolute right-0 z-10 bg-black/70 hover:bg-black p-3 rounded-full cursor-pointer"
    >
      ▶
    </button>
  </div>
</div>
  </div>


</template>
