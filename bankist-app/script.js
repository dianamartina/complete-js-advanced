'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// inseraree randuri cu depozit si retragere
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; //similar cu textContent doar ca returneaza si HTMl-ul

  // vrem sa facem sortarea, pentru a face o copie a array-ului folosim slice pt a putea aduga mai multe conditii ulterior. btnSort este butonul pe care apasam pt a face sortarea
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          
          <div class="movements__value">${mov}€</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html); //afiseaza elementle in UI
  });
};

// displayMovements(account1.movements); // dupa logare adaugam datele

//calcul total cont
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

// calcDisplayBalance(account1.movements);

// const user = 'Steven Thomas Williams'; //stw
//calcul total pentru suma depozite, suma retrageri si dobanda
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(depozit => (depozit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// calcDisplaySummary(account1.movements);

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => {
        return word[0];
      })
      .join('');
  });
};

createUsernames(accounts);
// console.log(accounts);

// functie ce calculeaza movements, balance si summary
const updateUI = function (currentAccount) {
  //Display movements
  displayMovements(currentAccount.movements);
  //Display balance
  calcDisplayBalance(currentAccount);
  //Display summary
  calcDisplaySummary(currentAccount);
};

//Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // prevent form for submitting
  // console.log('login');
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // console.log('login');
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// pentru a cere imprumut, trebuie verificat daca contul are cel putin un depozit, cu cel putin 10% din valoare de imprumut
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    // Add movement
    currentAccount.movements.push(amount);
    //Update Ui
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  // console.log(amount, receiverAcc);
  //curatam filturile de transfer
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc && // verificam daca exista utilizatorul, am integram cerinta cu ?
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // console.log('transfer valid');
    //Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // Update UI
    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  // console.log('del');
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    //Close account
    accounts.splice(index, 1);
    //Hide UI after closing the account
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});
//cu acest flag putem face schimbarea intre sortat si initial, accesand butonul
let sorted = false;

//apasam pe butonul de sortare
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

*/
// const checkDogs = (dogsJulia, dogsKate) => {
//   const dogsJuliaCorrected = [...dogsJulia].splice(1).splice(0, 2);
//   console.log(dogsJuliaCorrected);
//   const dogs = [...dogsJuliaCorrected, ...dogsKate];
//   dogs.forEach(function (dog, i) {
//     if (dog >= 3) {
//       console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
//     } else {
//       console.log(`Dog number ${i + 1} is still a puppy 🐶`);
//     }
//   });
// };

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

// // Coding Challenge #2

// /*
// Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

// Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

// 1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
// 2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
// 3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
// 4. Run the function for both test datasets

// TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
// TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

// */
// const calcAverageHumanAge = ages => {
//   const humanAge = ages.map(dog => {
//     if (dog <= 2) {
//       return 2 * dog;
//     } else {
//       return 16 + dog * 4;
//     }
//   });
//   console.log(humanAge);
//   const adultDog = humanAge.filter(dog => dog > 18);
//   console.log(adultDog);
//   // const average =
//   //   adultDog.reduce((acc, dog) => {
//   //     return acc + dog;
//   //   }, 0) / adultDog.length;
//   const average = adultDog.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );
//   console.log(average);
// };

// calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);

///////////////////////////////////////////////////////
// LECTURES
//
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const euroToUsd = 1.1;

// //Maps method
// const movementsUSD = movements.map(mov => mov * euroToUsd);

// console.count(movementsUSD); //220.00000000000003,495.00000000000006,-440.00000000000006,3300.0000000000005,-715.0000000000001,-143,77,1430.0000000000002: 1

// // map cu index
// const movementsDesc = movements.map((el, i) => {
//   return `Movement ${i + 1}:You ${el > 0 ? 'poz' : 'neg'} ${Math.abs(el)}`;
// });

// console.log(movementsDesc); //["Movement 1:You poz 200", "Movement 2:You poz 450", "Movement 3:You neg 400", "Movement 4:You poz 3000", "Movement 5:You neg 650", "Movement 6:You neg 130", "Movement 7:You poz 70", "Movement 8:You poz 1300"]

// /////////////////////////////////////////////////

// let arr = ['a', 'b', 'c', 'd', 'e'];

// //SLICE -  creaza un nou array
// console.log(arr.slice(2)); //['c', 'd', 'e']
// console.log(arr.slice(2, 4)); //['c', 'd'] al doilea parametru reprezinta ultima pozitie
// console.log(arr.slice(-2)); //['d', 'e']
// console.log(arr.slice(1, -2)); //['b', 'c']
// console.log(arr.slice()); //['a', 'b', 'c', 'd', 'e']
// // similar rezultat console.log([...arr]);

// //SPLICE - schimb arry-ul initial(mutate the array)
// // console.log(arr.splice(2)); //['c', 'd', 'e']
// console.log(arr); //['a', 'b']

// console.log(arr.splice(2, 2)); //['c', 'd'] -- aici al doilea parametru reprezinta numarul de elemente

// //REVERSE - - schimb arry-ul initial (mutate the array)
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['f', 'i', 'h', 'g', 'j'];
// console.log(arr2.reverse()); //["j", "g", "h", "i", "f"]

// //CONCAT
// const letters = arr.concat(arr2);
// console.log(letters); //["a", "b", "c", "d", "e", "j", "g", "h", "i", "f"]
// // similar console.log(...arr, ...arr2);

// //JOIN
// console.log(letters.join('-')); //a-b-c-d-e-j-g-h-i-f

// const mo = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // for (const el of mo) {
// for (const [i, el] of mo.entries()) {
//   if (el >= 0) {
//     console.log(`Movement ${i + 1} poz ${el}`);
//   } else {
//     console.log(`Movement ${i + 1} neg ${Math.abs(el)}`);
//   }
// }

// //forEach, trebuie sa treci prin tot array-ul
// mo.forEach(function (el, i, arr) {
//   // conteaza ordinea
//   if (el >= 0) {
//     console.log(`Movement ${i + 1} poz ${el}`);
//   } else {
//     console.log(`Movement ${i + 1} neg ${Math.abs(el)}`);
//   }
// });

// //Map
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key} : ${value}`);
// });

// //Set
// const currenciesUniq = new Set(['USD', 'GBP', 'USD', 'RON']);
// console.log(currenciesUniq);
// currenciesUniq.forEach(function (value, _, map) {
//   console.log(`${value} : ${value}`);
// });

// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// });

// console.log(deposits); //[200, 450, 3000, 70, 1300]

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
//accumulator  -> It's like a Snowball
// const balance = movements.reduce(function (acc, el, i, arr) {
//   console.log(`Iteration ${i} : ${acc}`);
//   return acc + el;
// }, 0); // acesta 0 este valoare initiala a acumulatorului

// console.log(balance);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const euroToUsd = 1.1;

// // Maximum value
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) {
//     return acc;
//   } else {
//     return mov;
//   }
// }, movements[0]);

// console.log(max); //3000

//metode inlantuite, primele sunt array-uri si la final avem o valoare
// const totalDeposits = movements
//   .filter(mov => mov > 0)
//   .map((mov, i, arr) => {
//     // console.log(arr);//aici avem array-ul filtrat
//     return mov * euroToUsd;
//   })
//   .reduce((acc, mov) => acc + mov, 0);

// console.log(totalDeposits); //5522

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// //returneaza primul ELEMENT din array care indeplineste conditia
// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal); //-400

// //////////////////////////////////////////////

// console.log(accounts);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// //Check Equality
// console.log(movements.includes(-130)); //true

// //Check a condition
// const anyDeposits = movements.some(mov => mov > 5000);
// console.log(anyDeposits);

//Every element meets the condition , then return true
// console.log(movements.every(mov => mov > 0)); //false

// Separate callback
// const deposit = mov => mov > 0;
// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

// flat
// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat()); //[1, 2, 3, 4, 5, 6, 7, 8]

// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat()); //[Array(2), 3, 4, Array(2), 7, 8]
// console.log(arrDeep.flat(2)); //[1, 2, 3, 4, 5, 6, 7, 8]

// // flat
// const overalBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overalBalance); //17840

// // flatMap - only one level deep
// const overalBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overalBalance2); //17840

///////////////////////////////////////
// Sorting Arrays

// Strings - ! modifica array-ul initial
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); //["Adam", "Jonas", "Martha", "Zach"]
// console.log(owners); //["Adam", "Jonas", "Martha", "Zach"]

// // Numbers
// console.log(movements); //[200, 450, -400, 3000, -650, -130, 70, 1300]
// //Rezultatul este acesta pt ca sortarea se face dupa stringuri
// // console.log(movements.sort()); //[-130, -400, -650, 1300, 200, 3000, 450, 70]

// // return < 0, A, B (keep order)
// // return > 0, B, A (switch order)

// // // Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
// //alta scriere mai scurta doar pt numere
// // movements.sort((a, b) => a - b);
// console.log(movements); //[-650, -400, -130, 70, 200, 450, 1300, 3000]

// // Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
// //alta scriere mai scurta doar pt numere
// // movements.sort((a, b) => b - a);
// console.log(movements); //[3000, 1300, 450, 200, 70, -130, -400, -650]

// New arrays
// const x = new Array(7);
// console.log(x); // [empty × 7]

//umple un array
// x.fill(1);
// console.log(x); //[1, 1, 1, 1, 1, 1, 1]

// //putem specifica de la ce index sa inceapa
// x.fill(1, 3);
// console.log(x); //[empty × 3, 1, 1, 1, 1]

//putem specifica de la ce index sa inceapa si la cat sa termine
// x.fill(1, 3, 5);
// console.log(x); //[empty × 3, 1, 1, empty × 2]

// const arr = [1, 2, 3, 4, 5, 6, 7];
// arr.fill(23, 3, 6);
// console.log(arr); //[1, 2, 3, 23, 23, 23, 7]

//Array.from
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y); //[1, 1, 1, 1, 1, 1, 1]

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z); //[1, 2, 3, 4, 5, 6, 7]

// // pt a prelua toate elementele din lista apasam pe un element aleator, aici s-a laes sumaTotala balance
// labelBalance.addEventListener('click', function () {
//   // face conversia din Node element in Array
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value')
//   ); //querySelectorAll -> ne da un Node list
//   console.log(movementsUI.map(el => el.textContent.replace('€', 'hh')));

//   // alta metoda de a converti un Node list in Array
//   const movementsUI2 = [...document.querySelectorAll('.movements__value')];
//   console.log(movementsUI2);
// });

// Array Methods

// Array Methods Practice

// 1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);

console.log(bankDepositSum);

// 2.
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;

// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

// console.log(numDeposits1000);

// // Prefixed ++ operator
// let a = 10;
// console.log(++a);
// console.log(a);

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// 4.
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');

  return capitalize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));
// */
