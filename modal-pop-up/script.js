'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');

const btnsOpenModal = document.querySelectorAll('.show-modal');
// console.log(btnsOpenModal);

// A.With out DRY principle
// for (let i = 0; i < btnsOpenModal.length; i++) {
//   btnsOpenModal[i].addEventListener('click', function () {
//     // console.log(btnsOpenModal[i].textContent);

//     modal.classList.remove('hidden'); // easier if you have more properties in a class
//     // modal.getElementsByClassName.display = 'block' // same result as above

//     overlay.classList.remove('hidden');
//   });
// }

// B.Using DRY principle
const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

for (let i = 0; i < btnsOpenModal.length; i++) {
  btnsOpenModal[i].addEventListener('click', openModal);
}

// A.With out DRY principle
//on the X button
// btnCloseModal.addEventListener('click', function () {
//   modal.classList.add('hidden');
//   overlay.classList.add('hidden');
// });

// // on the blur background
// overlay.addEventListener('click', function () {
//   overlay.classList.add('hidden');
//   modal.classList.add('hidden');
// });

// B.Using DRY principle
// this function has to be above the event Listener
const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (event) {
  //   console.log(event);

  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
