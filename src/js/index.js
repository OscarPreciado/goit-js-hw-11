import GalleryApi from "./gallery-fetch";
import simpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from "notiflix";
import axios from "axios";
import { renderGallery } from './create-gallery';
import { fetchImages } from './gallery-fetch';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);

const galleryApi = new GalleryApi();


function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  galleryApi.query = e.currentTarget.elements.searchQuery.value.trim();

  if (galleryApi.query === '') {
    clearAll();
    return Notify.info('Ingrese su consulta de búsqueda.');
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
         Notiflix.Notify.failure(
           'Sorry, there are no images matching your search query. Please try again.'
         );
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(
          `¡Hurra! Encontramos ${data.totalHits} imágenes.`
        );

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onLoadMoreBtn() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
         Notiflix.Notify.failure(
           'We are sorry, but you have reached the end of search results.'
         );
      }
    })
    .catch(error => console.log(error));
}
