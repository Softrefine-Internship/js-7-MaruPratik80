// write javascript here

const form = document.querySelector('.form-quiz-options');
const quizQuestions = document.querySelector('.quiz-questions');
const quizResults = document.querySelector('.quiz-results');
const spinner = document.querySelector('.spinner');
const errorModel = document.querySelector('.error-model');
const overlay = document.querySelector('.overlay');

const formInputs = document.querySelectorAll('.form__input');

const btnStartQuiz = document.querySelector('.btn--start-quiz');
const btnQuit = document.querySelector('.btn--quit');
const btnNext = document.querySelector('.btn--next');
const btnShowResults = document.querySelector('.btn--results');
const btnPlayNew = document.querySelector('.btn--play-new');
const btnCloseError = document.querySelector('.btn-close-error');

const questionNoEl = document.querySelector('.question-no');
const scoreEl = document.querySelector('.score');
const categoryEl = document.querySelector('.category');
const difficultyEl = document.querySelector('.difficulty');
const questionEl = document.querySelector('.question');
const answersEl = document.querySelector('.answers');
const totalScoreEL = document.querySelector('.total-score__value');
const errorMessageEl = document.querySelector('.error-message');

class QuizApp {
  #questions = [];
  #currentQuestion = {};
  #currentQuestionIndex = 0;
  #score = 0;

  constructor() {
    btnStartQuiz.addEventListener('click', this.#startQuiz.bind(this));
    btnNext.addEventListener('click', this.#updateQuestion.bind(this));
    btnShowResults.addEventListener('click', this.#showResults.bind(this));
    [btnQuit, btnPlayNew].forEach(btn => btn.addEventListener('click', this.#newQuiz.bind(this)));

    [btnCloseError, overlay].forEach(btn => btn.addEventListener('click', this.#closeErrorModel));

    answersEl.addEventListener('click', this.#checkAnswer.bind(this));
  }

  async #startQuiz(e) {
    try {
      e.preventDefault();
      const formData = Object.fromEntries([...new FormData(form)]);
      if (!formData.amount || formData.amount < 1 || formData.amount > 50)
        throw new Error('Number of questions must be between 1 to 50');

      form.classList.add('hidden');
      spinner.classList.remove('hidden');

      this.#questions = await this.#fetchQuestions(formData);

      spinner.classList.add('hidden');
      quizQuestions.classList.remove('hidden');
      btnNext.classList.remove('hidden');
      btnShowResults.classList.add('hidden');
      this.#currentQuestionIndex = this.#score = 0;

      this.#updateQuestion();
    } catch (err) {
      this.#renderError(err);
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
      if (data.response_code === 5) throw new Error(`Too Many Requests (${response.status})`);
      if (!response.ok) throw new Error(`Questions not found! (${response.status})`);
      if (data.response_code === 1) throw new Error(`The API doesn't have enough questions for your query`);

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

  #updateQuestion() {
    if (this.#currentQuestionIndex === this.#questions.length - 1) {
      btnNext.classList.add('hidden');
      btnShowResults.classList.remove('hidden');
    }

    const que = (this.#currentQuestion = this.#questions[this.#currentQuestionIndex]);

    questionNoEl.textContent = `Question ${this.#currentQuestionIndex + 1} out of ${this.#questions.length}`;
    scoreEl.textContent = `Score: ${this.#score}`;
    categoryEl.innerHTML = `Category: ${que.category}`;
    difficultyEl.innerHTML = `Difficulty: ${que.difficulty}`;

    questionEl.innerHTML = `${this.#currentQuestionIndex + 1}. ${que.question}`;
    answersEl.innerHTML = que.answers.map(ans => `<button class="answer">${ans}</button>`).join('');
    btnNext.disabled = btnShowResults.disabled = true;

    this.#currentQuestionIndex++;
  }

  #checkAnswer(e) {
    const answer = e.target.closest('.answer');
    if (!answer) return;

    const que = this.#currentQuestion;
    const classToAdd = answer.innerHTML === que.correctAnswer ? 'correct' : 'incorrect';
    answer.classList.add(classToAdd);

    if (classToAdd === 'incorrect') {
      Array.from(answersEl.children)
        .find(ans => ans.innerHTML === que.correctAnswer)
        .classList.add('correct');
    } else {
      this.#score++;
    }

    btnNext.disabled = btnShowResults.disabled = false;
  }

  #showResults() {
    quizQuestions.classList.add('hidden');
    quizResults.classList.remove('hidden');
    totalScoreEL.textContent = `${this.#score}/${this.#questions.length}`;
  }

  #newQuiz() {
    form.classList.remove('hidden');
    quizQuestions.classList.add('hidden');
    quizResults.classList.add('hidden');

    const [amount, ...otherInputs] = Array.from(formInputs);
    amount.value = 5;
    otherInputs.forEach(input => (input.value = ''));
  }

  #renderError(err) {
    errorModel.classList.remove('hide-err');
    overlay.classList.remove('hide-err');
    errorMessageEl.textContent = `⚠️ Error: ${err.message}`;

    form.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
  #closeErrorModel() {
    errorModel.classList.add('hide-err');
    overlay.classList.add('hide-err');
    formInputs[0].value = 5;
    formInputs[0].focus();
  }
}

const quizApp = new QuizApp();
