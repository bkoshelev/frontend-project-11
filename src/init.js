import {
  addMethod, string, setLocale,
} from 'yup';
import i18n from 'i18next';
import { AxiosError } from 'axios';
import view from './view.js';
import resources from './locales/ru.js';
import getPosts from './api/getPosts.js';
import XMLFeed from './utils/xml.js';
import Feeds from './utils/feeds.js';

const i18nextInstance = i18n.createInstance();

export default function init() {
  const state = {
    feeds: new Map(),
    posts: new Map(),
    ui: {
      feedback: { feedbackText: '', type: null },
      currentPreviewPost: null,
      preview: new Map(),
    },
  };

  i18nextInstance
    .init({
      lng: 'ru',
      resources,
    }).then(() => {
      setLocale({
        string: {
          url: 'errors.invalid',
          min: 'errors.notEmpty',
        },
      });

      addMethod(string, 'isExist', function hasUrlAlreadyAddedTest() {
        return this.test('isExist', 'errors.alreadyExist', (url) => !state.feeds.has(url));
      });

      const schema = string().url().min(1).isExist();

      const watchedObject = view(state, i18nextInstance);

      const feeds = new Feeds(watchedObject);

      document.querySelector('[data-element="form"]').addEventListener('submit', (event) => {
        event.preventDefault();
        const feedUrl = new FormData(event.target).get('url');

        schema.validate(feedUrl, {
          abortEarly: false,
        })
          .then(() => getPosts(feedUrl))
          .then((response) => {
            const xml = new XMLFeed(response.data.contents);

            feeds.addNewFeed(feedUrl, xml.getFeedData());

            xml
              .getPosts()
              .forEach((postData) => {
                feeds.addNewPostToFeed(feedUrl, postData);
              });
            watchedObject.ui.feedback = { type: 'success' };
          })
          .catch((error) => {
            watchedObject.ui.feedback = { type: 'error', error };
          });
      });

      document.querySelector('[data-element="posts"]').addEventListener('click', (event) => {
        if (event.target.dataset?.element === 'open_preview_button') {
          const { postId } = event.target.dataset;
          feeds.setPostAsViewed(postId);
          watchedObject.ui.currentPreviewPost = postId;
        }
      });

      const reloadPosts = () => {
        setTimeout(() => {
          Promise.allSettled(feeds.getFeedsList()
            .map((feedUrl) => getPosts(feedUrl)))
            .then((responses) => {
              const someRequestFailed = responses.some(({ status }) => status === 'rejected');
              if (someRequestFailed) {
                watchedObject.ui.feedback = { type: 'error', error: new AxiosError() };
              }
              responses
                .filter(({ status }) => status === 'fulfilled')
                .forEach(({ value: response }) => {
                  try {
                    const { url: feedUrl } = response.config.params;

                    const xml = new XMLFeed(response.data.contents);

                    const currentFeedPosts = feeds.getFeedPosts(feedUrl);
                    const newPosts = xml.getPosts();

                    newPosts
                      .forEach((newPostData) => {
                        const hasFeedAlreadyContainPost = currentFeedPosts
                          .some(([, postData]) => postData.title === newPostData.title);
                        if (!hasFeedAlreadyContainPost) {
                          feeds.addNewPostToFeed(feedUrl, newPostData);
                        }
                      });
                  } catch (error) {
                    watchedObject.ui.feedback = { type: 'error', error };
                  }
                });

              reloadPosts();
            });
        }, 5000);
      };
      reloadPosts();
    });
}
