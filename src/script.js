const renderImages = (images) => {
  const galleryEl = document.querySelector(".gallery");
  const galleryItemTemplate = document.querySelector("#galleryItemTemplate");

  images.forEach((data) => {
    const galleryItemClone = galleryItemTemplate.content.cloneNode(true);
    const img = galleryItemClone.querySelector(".gallery__img");
    const imgCaption = galleryItemClone.querySelector(".gallery__caption");
    const caption = new URL(data.img_url).searchParams.get("text");
    img.setAttribute("src", data.img_url);
    imgCaption.textContent = caption;
    galleryEl.appendChild(galleryItemClone);
  });
};

const renderPagination = ({ total, limit, page }) => {
  const totalPages = Math.ceil(total / limit);
  const maxPages = 5;
  let startPage;
  let endPage;
  let currentPage = page;
  let maxPagesBeforeCurrent;
  let maxPagesAfterCurrent;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  if (totalPages < maxPages) {
    startPage = 1;
    endPage = totalPages;
  } else {
    maxPagesBeforeCurrent = Math.floor(maxPages / 2); // 2
    maxPagesAfterCurrent = Math.ceil(maxPages / 2) - 1; // 2

    if (currentPage <= maxPagesBeforeCurrent) {
      // current page near the start
      startPage = 1;
      endPage = maxPages;
    } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
      // current page near the end
      startPage = maxPages - maxPagesAfterCurrent;
      //alternative: startPage = totalPages - maxPages + 1;
      endPage = totalPages;
    } else {
      // current page somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrent;
      endPage = currentPage + maxPagesAfterCurrent;
    }
  }

  let pages = Array.from(Array(endPage + 1 - startPage).keys()).map((i) => {
    return i + startPage;
  });

  const paginationItemTemplate = document.querySelector(
    "#paginationItemTemplate"
  );

  const paginationItems = pages.map((page) => {
    const paginationClone = paginationItemTemplate.content.cloneNode(true);
    const pageItem = paginationClone.querySelector("li");
    pageItem.textContent = page;

    if (page === currentPage) {
      pageItem.classList.add("is-active");
    }

    pageItem.addEventListener("click", (event) => {
      event.preventDefault();
      const page = event.target.innerText;
      window.location.search = `page=${page}`;
    });

    return pageItem;
  });

  const paginationTemplate = document.querySelector("#paginationTemplate");
  const paginationWrapper = paginationTemplate.content.cloneNode(true);
  const prevPage = paginationWrapper.querySelector(".prev-page");
  const nextPage = paginationWrapper.querySelector(".next-page");

  if (currentPage - maxPagesBeforeCurrent <= 1) {
    prevPage.classList.add("disabled");
  } else {
    prevPage.addEventListener("click", (event) => {
      event.preventDefault();
      const page = currentPage - 1;
      window.location.search = `page=${page}`;
    });
  }

  if (currentPage + maxPagesAfterCurrent >= totalPages) {
    nextPage.classList.add("disabled");
  } else {
    nextPage.addEventListener("click", (event) => {
      event.preventDefault();
      const page = currentPage + 1;
      window.location.search = `page=${page}`;
    });
  }

  paginationItems.forEach((item) => {
    paginationWrapper.firstElementChild.insertBefore(item, nextPage);
  });

  const footerPaginationEL = document.querySelector(".footer__pagination");
  footerPaginationEL.appendChild(paginationWrapper);
};

const renderSpinner = (isOn) => {
  const spinnerTemplate = document.querySelector("#spinnerTemplate");
  const spinnerEl = spinnerTemplate.content.cloneNode(true);
  const gallery = document.querySelector(".gallery");

  if (isOn) {
    gallery.appendChild(spinnerEl);
  } else {
    const child = gallery.querySelector(".spinner");

    if (child) {
      child.remove();
    }
  }
};

const getData = (page) => {
  return fetch(`http://blinterview.mocklab.io/pagination?page=${page}`)
    .then((res) => res.json())
    .then((res) => res);
};

(async () => {
  const url = new URL(window.location.href);
  const currentPage = url.searchParams.get("page") || 1;

  if (currentPage === "1") {
    window.location.search = "";
  }

  renderSpinner(true);
  const { data: images, meta } = await getData(currentPage);
  renderSpinner(false);

  renderImages(images);
  renderPagination(meta);
})();
