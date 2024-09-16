// write javascript here
const parentEL = document.querySelector('.quiz-container');
const form = document.querySelector('.form');
const questionAmount = document.getElementById('amount');
const category = document.getElementById('category');
const difficulty = document.getElementById('difficulty');
const type = document.getElementById('type');

const btnStartQuiz = document.querySelector('.btn--start-quiz');

const displayResult = function () {
  const markup = `
    <div class="quiz-result">
      <button class="btn btn--play-new">Play New Quiz</button>
    </div>
  `;
  parentEL.insertAdjacentHTML('beforeend', markup);
};

const displayQuestion = function (que, i, max) {
  const options = [que.correct_answer, ...que.incorrect_answers];

  const markup = `
    <div class="quiz ${i !== 0 ? 'hidden' : ''}">
      <header class="header">
        <div class="question-no">
          <p>Question ${i + 1} out of 10</p>
        </div>
        <div class="category">
          <p><strong>Category: </strong><span>${que.category}</span></p>
        </div>
        <div class="difficulty">
          <p><strong>Difficulty: </strong><span>${que.difficulty}</span></p>
        </div>
      </header>
      <p class="question">${que.question}</p>
      <ul class="options">
        ${options.map(option => `<li class="option">${option}</li>`).join('')}
      </ul>
      <button class="btn ${i !== max - 1 ? 'btn--next">Next Question' : 'btn--quit">Quit Quiz'}</button>
    </div>
  `;
  parentEL.insertAdjacentHTML('beforeend', markup);
};

const startQuiz = async function (e) {
  try {
    e.preventDefault();
    const formData = Object.fromEntries([...new FormData(form)]);

    if (!formData.amount) {
      return;
    }
    const amount = formData.amount;
    const category = formData.category ? `&category=${formData.category}` : '';
    const difficulty = formData.difficulty ? `&difficulty=${formData.difficulty}` : '';
    const type = formData.type ? `&type=${formData.type}` : '';

    form.classList.add('hidden');

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}${category}${difficulty}${type}`
    );
    const data = await response.json();

    const { results } = data;

    console.log(data);
    results.forEach((result, i) => displayQuestion(result, i, results.length));
  } catch (err) {
    console.error(err);
  }
};

btnStartQuiz.addEventListener('click', startQuiz);
parentEL.addEventListener('click', function (e) {
  btnNext = e.target.closest('.btn--next');
  if (btnNext) {
    btnNext.closest('.quiz').classList.add('hidden');
    btnNext.closest('.quiz').nextElementSibling.classList.remove('hidden');
  }

  btnQuit = e.target.closest('.btn--quit');
  if (btnQuit) {
    btnQuit.closest('.quiz').classList.add('hidden');
    // parentEL.innerHTML = '';
    displayResult();
  }

  btnPlayNew = e.target.closest('.btn--play-new');
  if (btnPlayNew) {
    // btnPlayNew.closest('.quiz-result').classList.add('hidden');
    parentEL.innerHTML = '';
    form.classList.remove('hidden');
  }
});

/* 
category: "Entertainment: Video Games"
correct_answer: "Interplay Entertainment "
difficulty: "medium"
incorrect_answers: Array(3)
0: "Capcom"
1: "Blizzard Entertainment"
2: "Nintendo"
length: 3
[[Prototype]]: Array(0)
question: "Which company did Bethesda purchase the Fallout Series from?"
type: "multiple"
*/
