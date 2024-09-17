// write javascript here
const questionAmount = document.getElementById('amount');
const category = document.getElementById('category');
const difficulty = document.getElementById('difficulty');
const type = document.getElementById('type');

const form = document.querySelector('.form-quiz-options');
const quizQuestions = document.querySelector('.quiz-questions');
const quizResults = document.querySelector('.quiz-results');
const spinner = document.querySelector('.spinner');

const btnStartQuiz = document.querySelector('.btn--start-quiz');
const btnQuit = document.querySelector('.btn--quit');
const btnNext = document.querySelector('.btn--next');
const btnShowResults = document.querySelector('.btn--results');
const btnPlayNew = document.querySelector('.btn--play-new');

const questionNoEl = document.querySelector('.question-no');
const scoreEl = document.querySelector('.score');
const categoryEl = document.querySelector('.category');
const difficultyEl = document.querySelector('.difficulty');
const questionEl = document.querySelector('.question');
const answersEl = document.querySelector('.answers');

class QuizApp {
  #questions = [];
  #currentQuestionIndex = 0;
  #score = 0;

  constructor() {
    btnStartQuiz.addEventListener('click', this.#startQuiz.bind(this));
    btnNext.addEventListener('click', this.#updateQuestion.bind(this));
    [btnQuit, btnPlayNew].forEach(btn => btn.addEventListener('click', this.#newQuiz));
    btnShowResults.addEventListener('click', this.#showResults.bind(this));
  }

  async #startQuiz(e) {
    try {
      e.preventDefault();
      const formData = Object.fromEntries([...new FormData(form)]);
      if (!formData.amount) throw new Error('Number of questions must be between 1 to 50');

      form.classList.add('hidden');
      spinner.classList.remove('hidden');

      this.#questions = await this.#fetchQuestions(formData);
      console.log(this.#questions);

      spinner.classList.add('hidden');
      quizQuestions.classList.remove('hidden');

      this.#updateQuestion();
    } catch (err) {
      console.error(err);
    }
  }

  async #fetchQuestions(formData) {
    try {
      const amount = formData.amount;
      const category = formData.category ? `&category=${formData.category}` : '';
      const difficulty = formData.difficulty ? `&difficulty=${formData.difficulty}` : '';
      const type = formData.type ? `&type=${formData.type}` : '';

      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}${category}${difficulty}${type}`
      );
      const data = await response.json();
      console.log(data);

      const formatedQuestions = data.results
        .map(result => {
          return {
            type: result.type,
            difficulty: result.difficulty,
            category: result.category,
            question: result.question,
            correctAnswer: result.correct_answer,
            answers: [result.correct_answer, ...result.incorrect_answers].sort(() => Math.random() - 0.5),
          };
        })
        .sort(() => Math.random() - 0.5);
      return formatedQuestions;
    } catch (err) {
      throw err;
    }
  }

  #showResults() {}

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

  #updateQuestion() {
    if (this.#currentQuestionIndex + 1 === this.#questions.length) {
      btnNext.classList.add('hidden');
      btnShowResults.classList.remove('hidden');
    }
    const que = this.#questions[this.#currentQuestionIndex];

    questionNoEl.textContent = `Question ${this.#currentQuestionIndex + 1} out of ${this.#questions.length}`;
    scoreEl.textContent = `Score: ${this.#score}`;
    categoryEl.textContent = `Category: ${que.category}`;
    difficultyEl.textContent = `Difficulty: ${que.difficulty}`;

    questionEl.innerHTML = `${this.#currentQuestionIndex + 1}. ${que.question}`;
    answersEl.innerHTML = que.answers.map(ans => `<button class="answer">${ans}</button>`).join('');
    btnNext.disabled = false;

    this.#currentQuestionIndex++;
  }
  /* 
<header class="question-header">
  <p class="question-no"><!-- Question 1 out of 10 --></p>
  <p class="score"><!-- Score: 0 --></p>
  <p class="category"><!-- Category: Entertainment: Video Games --></p>
  <p class="difficulty"><!-- Difficulty: medium --></p>
</header>

<h3 class="question"><!-- 1. Which company did Bethesda purchase the Fallout Series from? --></h3>
<div class="answers">
  <!-- <button class="answer correct">Interplay Entertainment</button>
  <button class="answer incorrect">Capcom</button>
  <button class="answer">Blizzard Entertainment</button>
  <button class="answer">Nintendo</button> -->
</div>
*/

  #newQuiz() {
    form.classList.remove('hidden');
    quizQuestions.classList.add('hidden');
    quizResults.classList.add('hidden');
  }
}

const quizApp = new QuizApp();
