import onChange from 'on-change';

const elements = {
  feeds: document.querySelector('.feeds').firstElementChild,
  posts: document.querySelector('.posts').firstElementChild,
  modalTitle: document.querySelector('.modal-title'),
  modalBody: document.querySelector('.modal-body'),
  modalFooter: document.querySelector('.modal-footer'),
  feedback: document.querySelector('.feedback'),
  newFeedInput: document.querySelector('input'),
};

export default function view(state, i18nextInstance) {
  return onChange(state, (path, value) => {
    if (path.includes('feedback')) {
      document.forms[0].elements[0].classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger', 'text-success');

      switch (value.type) {
        case 'inputError':
          document.forms[0].elements[0].classList.add('is-invalid');
          elements.feedback.classList.add('text-danger');
          break;
        case 'success':
          elements.feedback.classList.add('text-success');
          elements.newFeedInput.value = '';
          elements.newFeedInput.focus();
          break;
        default:
          elements.feedback.classList.add('text-danger');
          break;
      }
      elements.feedback.textContent = value.feedbackText;
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

    if (path.includes('posts')) {
      const postList = [...state.posts.entries()].map(([postId, postData]) => ` <li
                    class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"
                    data-post-id=${postId}
                >
                    <a
                    href="${postData.link}"
                    class="${postData.hasViewed ? 'fw-normal link-secondary' : 'fw-bold'}"
                    target="_blank"
                    rel="noopener noreferrer"
                    >${postData.title}</a
                    >
                    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal"
                    data-bs-backdrop="false">
                    ${i18nextInstance.t('view')}
                    </button>
                </li>
                `).join('');

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

    if (path === 'currentPreviewPost') {
      const { title, description, link } = state.posts.get(value);
      elements.modalTitle.textContent = title;
      elements.modalBody.textContent = description;
      elements.modalFooter.firstElementChild.setAttribute('href', link);
    }
  });
}
