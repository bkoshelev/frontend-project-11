import onChange from 'on-change';

const elements = {
  feeds: document.querySelector('[data-element="feeds"]').firstElementChild,
  posts: document.querySelector('[data-element="posts"]').firstElementChild,
  modalTitle: document.querySelector('[data-element="modalTitle"]'),
  modalBody: document.querySelector('[data-element="modalBody"]'),
  modalFooter: document.querySelector('[data-element="modalFooter"]'),
  feedback: document.querySelector('[data-element="feedbackText"]'),
  newFeedInput: document.querySelector('[data-element="newFeedInput"]'),
};

export default function view(state, i18nextInstance) {
  document.querySelector('[data-element="addNewFeedButton"]').removeAttribute('disabled');

  return onChange(state, (path, value, previousValue, applyData) => {
    if (path.includes('ui.feedback')) {
      document.forms[0].elements[0].classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger', 'text-success');

      let feedbackText = '';
      switch (value.type) {
        case 'error':
          switch (value.error.name) {
            case 'ValidationError':
              document.forms[0].elements[0].classList.add('is-invalid');
              feedbackText = value.error.inner[0].message;
              break;
            case 'AxiosError':
              feedbackText = 'errors.network';
              break;
            case 'XMLError':
              feedbackText = 'errors.wrongFeed';
              break;
            default:
              break;
          }
          elements.feedback.classList.add('text-danger');
          break;
        case 'success':
          feedbackText = 'success';
          elements.feedback.classList.add('text-success');
          elements.newFeedInput.value = '';
          elements.newFeedInput.focus();
          break;
        default:
          elements.feedback.classList.add('text-danger');
          break;
      }
      elements.feedback.textContent = i18nextInstance.t(feedbackText);
    }

    if (path.includes('feeds')) {
      const feedList = [...state.feeds.entries()]
        .map(([, feedData]) => `
                    <li class="list-group-item border-0 border-end-0">
                    <h3 class="h6 m-0">${feedData.title}</h3>
                    <p class="m-0 small text-black-50">${feedData.description}</p>
                </li>`).join('');
      elements.feeds.innerHTML = `
                    <div class="">
                        <div class="card-body">
                            <h2 class="card-title h4">${i18nextInstance.t('feeds')}</h2>
                        </div>
                        <ul class="list-group border-0 rounded-0">
                           ${feedList}
                        </ul>
                    </div>
                `;
    }

    if (path.includes('ui.preview')) {
      const [postId, { hasViewed }] = applyData.args;
      if (hasViewed) {
        document.querySelector(`[data-element="open_preview_link"][data-post-id="${postId}"]`).classList
          .add('fw-normal', 'link-secondary')
          .remove('fw-bold');
      }
    }

    if (path.includes('posts')) {
      const postList = [...state.posts.entries()].map(([postId, postData]) => {
        let className = 'fw-bold';
        if (state.ui.preview.get(postId)?.hasViewed) {
          className = 'fw-normal link-secondary';
        }
        return ` <li
                        class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
                        <a
                        data-post-id=${postId}
                        data-element="open_preview_link"
                        href="${postData.link}"
                        class="${className}"
                        target="_blank"
                        rel="noopener noreferrer"
                        >${postData.title}</a
                        >
                        <button
                        data-post-id=${postId} data-element="open_preview_button" type="button"
                        class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal"
                        data-bs-backdrop="false">
                        ${i18nextInstance.t('view')}
                        </button>
                    </li>
                    `;
      }).join('');

      elements.posts.innerHTML = `
                    <div class="">
                        <div class="card-body">
                            <h2 class="card-title h4">${i18nextInstance.t('postsHeading')}</h2>
                        </div>
                        <ul class="list-group border-0 rounded-0 flex-column-reverse">
                           ${postList}
                        </ul>
                    </div>
                `;
    }

    if (path === 'ui.currentPreviewPost') {
      const { title, description, link } = state.posts.get(value);
      elements.modalTitle.textContent = title;
      elements.modalBody.textContent = description;
      elements.modalFooter.firstElementChild.setAttribute('href', link);
    }
  });
}
