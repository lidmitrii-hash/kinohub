import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MovieCard from '@/views/MovieCard.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/movie/:id', name: 'Movie', component: MovieCard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;


