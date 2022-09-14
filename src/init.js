import { string, setLocale } from 'yup';
import i18n from 'i18next';
import view from './view.js';
import resources from './locales/ru.js';
import getPosts from './api/getPosts.js';
import { addNewFeed, addNewPostToFeed } from './utils/feeds.js';
import XMLparse from './utils/xml.js';

const UPDATE_TIME = 5000;

const i18nextInstance = i18n.createInstance();

export default function init() {
  const state = {
    feeds: {
      ids: [],
      items: [],
    },
    posts: {
      items: [],
    },
    ui: {
      feedback: { error: null, type: null },
      currentPreviewPost: null,
      seenPosts: new Set(),
    },
  };

  const elements = {
    feeds: document.querySelector('.feeds').firstElementChild,
    posts: document.querySelector('.posts').firstElementChild,
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalFooter: document.querySelector('.modal-footer'),
    feedback: document.querySelector('.feedback'),
    newFeedInput: document.querySelector('.form-control'),
    form: document.querySelector('.rss-form'),
    addNewFeedButton: document.querySelector('.rss-form button[type="submit"]'),
  };

  i18nextInstance
    .init({
      lng: 'ru',
      resources,
    }).then(() => {
      setLocale({
        string: {
          url: 'errors.invalid',
        },
        mixed: {
          required: 'errors.notEmpty',
          notOneOf: 'errors.alreadyExist',
        },
      });

      const schema = string().required().url();

      const watchedObject = view(state, i18nextInstance, elements);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const feedUrl = new FormData(event.target).get('url');

        const actualUrlSchema = schema.notOneOf(state.feeds.ids);

        actualUrlSchema.validate(feedUrl, {
          abortEarly: false,
        })
          .then(() => getPosts(feedUrl))
          .then((response) => {
            const { feedData, posts } = XMLparse(response.data.contents);
            addNewFeed(watchedObject, feedUrl, feedData);

            posts.forEach((postData) => {
              addNewPostToFeed(watchedObject, feedUrl, postData);
            });
            watchedObject.ui.feedback = { type: 'success' };
          })
          .catch((error) => {
            watchedObject.ui.feedback = { type: 'error', error };
          });
      });

      elements.posts.addEventListener('click', (event) => {
        if (event.target.classList.contains('open_preview_button')) {
          const postId = event.target.previousElementSibling.textContent;
          watchedObject.ui.seenPosts.add(postId);
          watchedObject.ui.currentPreviewPost = postId;
        }
      });

      const reloadPosts = () => {
        const requests = state.feeds.ids.map((feedUrl) => getPosts(feedUrl)
          .then((response) => {
            const { posts: newPosts } = XMLparse(response.data.contents);

            newPosts
              .forEach((newPostData) => {
                const hasFeedAlreadyContainPost = state.feeds.items
                  .find(({ id }) => feedUrl === id).posts.includes(newPostData.title);
                if (!hasFeedAlreadyContainPost) {
                  addNewPostToFeed(watchedObject, feedUrl, newPostData);
                }
              });
          }).catch((error) => {
            watchedObject.ui.feedback = { type: 'error', error };
          }));

        setTimeout(() => {
          Promise.all(requests)
            .finally(() => {
              reloadPosts();
            });
        }, UPDATE_TIME);
      };
      reloadPosts();
    });
}
