import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: import.meta.env.VITE_TDMB_KEY,
    language: 'ru-RU'
  },
   headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YzE2ZGZmNDdkOWY3ZmIyZDJjZTU1ZDJiMjJhOTNlYiIsIm5iZiI6MTc1NTM2NjQ0Ny4xNTUsInN1YiI6IjY4YTBjNDJmM2MzOTdlMWU2YmVkMTNjMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FLX1B8e96ECtZGNFoFnT3Eypenr1pr6iu_6o4aHfnzg'
  }
});

export default api;
