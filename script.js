// write javascript here

const form = document.querySelector('.form-quiz-options');
const quizQuestions = document.querySelector('.quiz-questions');
const quizResults = document.querySelector('.quiz-results');
const spinner = document.querySelector('.spinner');

const formInputs = document.querySelectorAll('.form__input');
const categoryInput = document.getElementById('category');

const btnStartQuiz = document.querySelector('.btn--start-quiz');
const btnQuitQuiz = document.querySelector('.btn--quit-quiz');
const btnNext = document.querySelector('.btn--next');
const btnShowResults = document.querySelector('.btn--results');
const btnPlayNew = document.querySelector('.btn--play-new');

const questionNoEl = document.querySelector('.question-no');
const scoreEl = document.querySelector('.score');
const categoryEl = document.querySelector('.category');
const difficultyEl = document.querySelector('.difficulty');
const questionEl = document.querySelector('.question');
const answersEl = document.querySelector('.answers');
const totalScoreEL = document.querySelector('.total-score__value');

const model = document.querySelector('.model');
const overlay = document.querySelector('.overlay');
const modelMessageEl = document.querySelector('.model__message');
const modelBtnsEL = document.querySelector('.model__btns');
const btnContinue = document.querySelector('.btn--continue');
const btnQuit = document.querySelector('.btn--quit');
const btnCloseModel = document.querySelector('.btn-close-model');

class QuizApp {
  #questions = [];
  #currentQuestionIndex = 0;
  #correctAnswer;
  #score = 0;

  constructor() {
    this.#init();
  }

  async #init() {
    // Event handlers
    btnStartQuiz.addEventListener('click', this.#startQuiz.bind(this));
    btnNext.addEventListener('click', this.#updateQuestion.bind(this));
    btnShowResults.addEventListener('click', this.#showResults.bind(this));
    btnPlayNew.addEventListener('click', this.#newQuiz.bind(this));
    btnQuitQuiz.addEventListener('click', this.#confirmQuit.bind(this));
    btnQuit.addEventListener('click', this.#quitQuiz.bind(this));
    [btnCloseModel, btnContinue, overlay].forEach(btn => btn.addEventListener('click', this.#closeModel));
    answersEl.addEventListener('click', this.#checkAnswer.bind(this));

    // Category
    try {
      const res = await fetch('https://opentdb.com/api_category.php');
      if (!res.ok) throw new Error('No internet connection');
      const { trivia_categories: category } = await res.json();
      const markup = category
        .map(cat => `<option value="${cat.id}">${cat.name.replace('Entertainment: ', '')}</option>`)
        .join('');
      categoryInput.firstElementChild.insertAdjacentHTML('afterend', markup);
    } catch (err) {
      console.error(err);
    }
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
            category: result.category.replace('Entertainment: ', ''),
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

    const que = this.#questions[this.#currentQuestionIndex];
    this.#correctAnswer = que.correctAnswer;

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

    const answers = Array.from(answersEl.children);

    const classToAdd = answer.innerHTML === this.#correctAnswer ? 'correct' : 'incorrect';
    answer.classList.add(classToAdd);

    if (classToAdd === 'incorrect') {
      answers.find(ans => ans.innerHTML === this.#correctAnswer).classList.add('correct');
    } else {
      this.#score++;
    }
    scoreEl.textContent = `Score: ${this.#score}`;
    answers.forEach(ans => (ans.disabled = true));

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
    this.#showModel(`⚠️ Error: ${err.message}`);
    modelBtnsEL.classList.add('hidden');
    form.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
  #showModel(message) {
    model.classList.remove('hide');
    overlay.classList.remove('hide');
    modelMessageEl.textContent = message;
  }
  #closeModel() {
    model.classList.add('hide');
    overlay.classList.add('hide');
    formInputs[0].value = 5;
    formInputs[0].focus();
  }
  #confirmQuit() {
    this.#showModel('⚠️ Are you sure you want to quit quiz?');
    modelBtnsEL.classList.remove('hidden');
  }
  #quitQuiz() {
    this.#closeModel();
    this.#newQuiz();
  }
}

const quizApp = new QuizApp();
