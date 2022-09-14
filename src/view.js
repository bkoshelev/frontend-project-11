import onChange from 'on-change';

export default function view(state, i18nextInstance, elements) {
  elements.addNewFeedButton.removeAttribute('disabled');

  const handleFeedbackElement = (value) => {
    elements.newFeedInput.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger', 'text-success');

    let feedbackText = '';
    switch (value.type) {
      case 'error':
        switch (value.error.name) {
          case 'ValidationError':
            elements.newFeedInput.classList.add('is-invalid');
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
  };

  const handleFeedList = (value) => {
    const feedList = value
      .map((feedData) => `
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
  };

  const handlePostList = (value) => {
    const postList = value.map((postData) => {
      let className = 'fw-bold';
      if (state.ui.seenPosts.has(postData.id)) {
        className = 'fw-normal link-secondary';
      }
      return ` <li
                      class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
                      <a
                      href="${postData.link}"
                      class="${className}"
                      target="_blank"
                      rel="noopener noreferrer"
                      >${postData.title}</a
                      >
                      <button
                      type="button"
                      class="btn btn-outline-primary open_preview_button btn-sm" data-bs-toggle="modal" data-bs-target="#modal"
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
  };

  const handlePreviewModal = (value) => {
    const { title, description, link } = state.posts.items.find(({ id }) => id === value);
    elements.modalTitle.textContent = title;
    elements.modalBody.textContent = description;
    elements.modalFooter.firstElementChild.setAttribute('href', link);
  };

  return onChange(state, (path, value) => {
    switch (path) {
      case 'feeds.items':
        handleFeedList(value);
        break;
      case 'posts.items':
        handlePostList(value);
        break;
      case 'ui.feedback':
        handleFeedbackElement(value);
        break;
      case 'ui.seenPosts':
        handlePostList(state.posts.items);
        break;
      case 'ui.currentPreviewPost':
        handlePreviewModal(value);
        break;
      default:
        break;
    }
  });
}
