import axios from 'axios';
import Notiflix from 'notiflix';

import './css/styles.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
let lastQueryValue = null;

let requestParams = {
  searchText: null,
  page: 0,
  countPerPage: 40,
};

form.addEventListener('submit', async e => {
  e.preventDefault();

  const queryValue = e.target.elements.searchQuery.value;

  if (lastQueryValue === queryValue) {
    return;
  } else {
    clearGallery();
    toggleShowMoreVisible(false);
    lastQueryValue = queryValue;
  }

  requestParams.page = 1;
  requestParams.searchText = queryValue;

  const data = await fetchImages(requestParams);

  showResult(data);
  toggleShowMoreVisible(true);
});

loadMoreButton.addEventListener('click', async () => {
  requestParams.page++;

  const data = await fetchImages(requestParams);

  showResult(data);

  const summaryImagesCount =
    (requestParams.page - 1) * requestParams.countPerPage + data.hits.length;

  if (summaryImagesCount >= data.totalHits) {
    toggleShowMoreVisible(false);
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
});

async function fetchImages(params) {
  try {
    let response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '31628127-262f2d43a2a151032d1eaa569',
        q: params.searchText,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: params.page,
        per_page: params.countPerPage,
      },
    });

    if (response.data.total === 0) {
      throw new Error();
    }

    return response.data;
  } catch (e) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function toggleShowMoreVisible(isVisible) {
  loadMoreButton.classList.toggle('visible', isVisible);
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showResult(resultData) {
  const { hits } = resultData;

  const hitsStrings = hits.map(
    hit => `
      <div class="photo-card">
        <img class="image-preview" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <span>${hit.likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span>${hit.views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span>${hit.comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span>${hit.downloads}</span>
          </p>
        </div>
      </div>
  `
  );

  gallery.insertAdjacentHTML('beforeend', hitsStrings.join(''));
}
