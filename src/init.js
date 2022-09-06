import { string, setLocale } from 'yup';
import i18n from 'i18next';
import { nanoid } from 'nanoid';
import view from './view.js';
import resources from './locales/ru.js';
import getPosts from './api/getPosts.js';
import { xmlToDOM } from './utils/xml.js';
import { getFeedData, getPostData } from './utils/rss.js';

const i18nextInstance = i18n.createInstance();

i18nextInstance.init({
  lng: 'ru',
  resources,
});

setLocale({
  string: {
    url: i18nextInstance.t('errors.invalid'),
    min: i18nextInstance.t('errors.notEmpty'),
  },
});

const schema = string().url().min(1);

export default function init() {
  const state = {
    url: '',
    feeds: new Map(),
    posts: new Map(),

  };

  const watchedObject = view(state, i18nextInstance);

  document.addEventListener('input', (event) => {
    watchedObject.url = event.target.value;
  });

  document.addEventListener('submit', (event) => {
    event.preventDefault();

    schema.validate(watchedObject.url, {
      abortEarly: false,
    })
      .then(() => {
        if (state.feeds.has(watchedObject.url)) {
          watchedObject.feedback = { feedbackText: i18nextInstance.t('errors.alreadyExist') };
          return;
        }

        getPosts(watchedObject.url)
          .then((response) => {
            const dom = xmlToDOM(response.data.contents);
            const errorNode = dom.querySelector('parsererror');
            if (errorNode) {
              watchedObject.feedback = { feedbackText: i18nextInstance.t('errors.wrongFeed') };
              return;
            }

            watchedObject.feeds.set(watchedObject.url, { ...getFeedData(dom), posts: [] });

            [...dom.querySelectorAll('item')].reverse().forEach((post) => {
              const postId = nanoid();
              watchedObject.posts.set(postId, { ...getPostData(post), hasViewed: false });
              watchedObject.feeds.get(watchedObject.url).posts.push(postId);
            });
            watchedObject.feedback = { feedbackText: i18nextInstance.t('success'), type: 'success' };
            watchedObject.url = '';
          })
          .catch(() => {
            watchedObject.feedback = { feedbackText: i18nextInstance.t('errors.network') };
          });
      })
      .catch((error) => {
        watchedObject.feedback = { feedbackText: error.inner[0].message, type: 'inputError' };
      });
  }, true);

  document.querySelector('.posts').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      const { postId } = event.target.closest('li').dataset;
      watchedObject.posts.set(postId, {
        ...watchedObject.posts.get(postId),
        hasViewed: true,
      });
      watchedObject.currentPreviewPost = postId;
    }
  });
  const reloadPosts = () => {
    setTimeout(() => {
      if (state.feeds.size > 0) {
        try {
          Promise.all([...state.feeds.entries()]
            .map(([feedURL]) => getPosts(feedURL)))
            .then((responses) => {
              responses.forEach((response) => {
                const { url } = response.config.params;
                const { contents } = response.data;

                const dom = xmlToDOM(contents);
                const errorNode = dom.querySelector('parsererror');
                if (errorNode) {
                  watchedObject.errors = i18nextInstance.t('errors.wrongFeed');
                  return;
                }
                const feedPostsIds = state.feeds.get(url).posts;

                const feedPosts = [...state.posts
                  .entries()]
                  .filter(([postId]) => feedPostsIds.includes(postId));

                [...dom.querySelectorAll('item')]
                  .reverse()
                  .forEach((post) => {
                    const newPostData = { ...getPostData(post), hasViewed: false };
                    if (!feedPosts.some(([, postData]) => postData.title === newPostData.title)) {
                      const postId = nanoid();
                      watchedObject.posts.set(postId, newPostData);
                      watchedObject.feeds.get(url).posts.push(postId);
                    }
                  });
              });

              reloadPosts();
            });
        } catch (error) {
          watchedObject.feedback = { feedbackText: i18nextInstance.t('errors.network') };
        }
      } else {
        reloadPosts();
      }
    }, 5000);
  };
  reloadPosts();
}