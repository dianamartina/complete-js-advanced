'use strict';

//cream variabile globale pt a putea lua valorile dintr-un block si a le folosi in altul
class Workout {
  date = new Date();
  //ar trebui sa folosim o librarie care sa genereze id-uri
  id = (Date.now() + '').slice(-10); //iau ultimele cifre din data, pt a crea un id unic
  clicks = 0;

  constructor(coords, distance, duration) {
    //   this.date=...// cu ES6
    //   this.id = .. //cu ES6
    this.coords = coords; //[lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  _setDescription() {
    //daca scriu comentariul de mai jos Prettier imi va lasa formatarea pe care o stabilesc eu pe randul urmator
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  //daca vrem sa stim de cate ori s-a dat click pe o caseta
  click() {
    this.clicks++;
    // console.log(this.clicks);
  }
}

class Running extends Workout {
  type = 'running'; // scriere moderna

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    // this.type = 'running';//scriere in ES6
    this._setDescription();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling'; // scriere moderna

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    // this.type = 'cycling';//scriere in ES6
    this._setDescription();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//Verificam ca primi datele
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

/////////////////////////////////////////////////////////////////
//Application architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  //# class field specofocations , inca nu face parte din JS
  #map; //private instance properties
  #mapZoomLevel = 13;
  #mapEvent; //private instance properties
  #workouts = [];

  constructor() {
    //Get users's position
    this._getPosition();

    //Get data from local storage
    this._getLocalStorage();

    //Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    //we get the geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //   console.log(latitude, longitude);
    //   console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    //we need an element cu id-ul map in html-ul nostru
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //numarul reprezinta zoom-ul

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //   console.log(map);

    //Handling clicks on map
    // map este un obiect generat de Liflet, si metoda on ii apartine
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work); // aici afisez markerii pt ca harta s-a incarcat
    });
  }

  _showForm(mapE) {
    // console.log(mapEvent); //primim info daca dam click pe harta
    this.#mapEvent = mapE; // pt a prlua valoare in variabila globala
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    //helper function for validation
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    e.preventDefault();

    // helper function for positive numbers
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; //cu + le convertesc in numere
    const duration = +inputDuration.value; //cu + le convertesc in numere
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // nu se mai foloseste asa de des if else, mai degraba if if
    //If workout running, create running object
    if (type === 'running') {
      //Check if data is valid
      const cadence = +inputCadence.value;
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        //inlocuim cu functia ajutatoare
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        //inlocuim cu functia ajutatoare
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Cycling([lat, lng], distance, elevation);
    }
    //Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

    //Hide form + clear input fields
    // inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
    //   '';
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    //Display marker ( picatura ce indica locatia exacta)
    //preluam lat si  long din evnt la click
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, //aici adaugam clasa noastra de css
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
     `;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    // console.log(workoutEl);
    if (!workoutEl) return; // cu aceasta scriere opresc continuarea citirii codului

    //verific pe ce caseta am apasat
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // console.log(workout);

    //muta pozitia hartii in functie de coordonate
    //from Leaflet method
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animation: true,
      pan: {
        duration: 1,
      },
    });

    //using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    //localstorage it's an API pe care il primim de la browser
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);

    if (!data) return;

    this.#workouts = data; //preiau datele

    this.#workouts.forEach(work => {
      this._renderWorkout(work); //afisez casetele din sesiunile trecute
      //nu pot sa afisez aici si markerii pe harta pt ca harta se incarca dupa constructor
    });
  }

  //resetez local storage - programatic. In consola scriu:  app.reset()
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
// app._getPosition();// apelul functiei l-am mutat in
