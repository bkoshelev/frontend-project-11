import axios from 'axios';

const HOST = 'https://allorigins.hexlet.app';

export const axiosInstance = axios.create({
  baseURL: HOST,
});

const urls = {
  send: '/get',
};

export default function getPosts(feedURL = 'https://ru.hexlet.io/lessons.rss') {
  return axiosInstance(urls.send, {
    params: {
      url: feedURL,
      disableCache: true,
    },
  });
}
