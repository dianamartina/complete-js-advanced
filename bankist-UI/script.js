'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
//Btn scrolling
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// for (let i = 0; i < btnsOpenModal.length; i++)
//   btnsOpenModal[i].addEventListener('click', openModal);
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
//////////////////////////////////////////////////////////////////

btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  // console.log(s1coords);
  // console.log(e.target.getBoundingClientRect());

  // Scrolling
  //var 3 - noua
  section1.scrollIntoView({ behavior: 'smooth' });
});

//////////////////////////////////////////////////////////////
//Page navigation

//var 1. smooth scrolling to the ancor from the nav link
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault(); //la click pe nav link nu mai face trimiterea catre ancora, catre sectiunea din pagina
//     // console.log('link');
//     const id = this.getAttribute('href');
//     // console.log(id);//#section--1,  ..2, ..3
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// var2. Event delegation: smooth scrolling to the ancor from the nav link
//1.Add event Listener to common parent element
//2. Determine what element originaed that event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  // console.log(e.target);
  e.preventDefault(); //la click pe nav link nu mai face trimiterea catre ancora, catre sectiunea din pagina

  //Matching startegy
  if (e.target.classList.contains('nav__link')) {
    // console.log('link');
    const id = e.target.getAttribute('href');
    // console.log(id);//#section--1,  ..2, ..3
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

///////////////////////////////////////////////////////////////////
//Tabbed component
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

//nerecomandat pt perforamanta
// tabs.forEach(t => t.addEventListener('click', () => console.log('tab')));

tabsContainer.addEventListener('click', function (e) {
  // e.preventDefault();
  //preiau butonul indiferent daca apas pe buton sau pe textul din buton
  const clicked = e.target.closest('.operations__tab');
  // console.log(clicked);

  //Guard clause - daca nu s-a apasat pe buton nu mai executa ultima linie
  if (!clicked) return;

  //stergem inainte toate elementele care ar putea avea clasa activa
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));

  //adaugam clasa dor pe elementul activ
  clicked.classList.add('operations__tab--active');

  //Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});
///////////////////////////////////////////////////////////////////
//Menu face animation

const handleHover = function (e, opacity) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;

    const siblings = link.closest('.nav').querySelectorAll('.nav__links'); // am ales bunicul

    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this; //aici this este opacity
    });
    logo.style.opacity = this;
  }
};

//folosim mouseover pt ca mouseenter nu face bubbling

//aici preluam parintele si cu logo
// nav.addEventListener('mouseover', function (e) {
//   handleHover(e, 0.5);
// });
//sau
nav.addEventListener('mouseover', handleHover.bind(0.5));

// opusul lui mouseover
nav.addEventListener('mouseout', handleHover.bind(1));

// var2.Sticky navigation: Intersection Observer API
const header = document.querySelector('.header');
//calculam height dinamic
const navHeight = nav.getBoundingClientRect().height;
// console.log(navHeight);

const stickyNav = function (entries) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`, //specifica la ce distanta se opreasca headerul, merge doar in px
});
headerObserver.observe(header);

//Reveal sections
const allSections = document.querySelectorAll('.section');
const revealSection = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry);

  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  // section.classList.add('section--hidden');
});

//Lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]');
// console.log(imgTarget);

const loadImg = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) return;

  //Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

//Slider cu imagini

const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');

  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  //ajutor pentru scriere cod
  // const slider = document.querySelector('.slider');
  // slider.style.transform = 'scale(0.3) translateX(-800px)';
  // slider.style.overflow = 'visible';

  // Functions
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    //stergem clasa active de pe fiecare
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));
    //adaugam clasa active
    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    ); //-100%, 0%, 100%, 200%
  };

  goToSlide(0); //inlocuieste codul de mai jos
  // slides.forEach((s, i) => (s.style.transform = `translateX(${100 * i}%)`)); //0%, 100%, 200%, 300%

  //Go to next slide
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  //activam elementul care apare la prima incarcare
  const init = function () {
    goToSlide(0);
    createDots();

    activateDot(0); //adaugam clasa active la prima incarcare
  };
  init();
  // Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
    // console.log(e);
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      // console.log('dot');
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};

slider();

