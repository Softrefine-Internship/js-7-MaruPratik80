// write javascript here
const questionAmount = document.getElementById('amount');
const category = document.getElementById('category');
const difficulty = document.getElementById('difficulty');
const type = document.getElementById('type');
const formInputs = document.querySelectorAll('.form__input');

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

const totalScoreEL = document.querySelector('.total-score__value');

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

    answersEl.addEventListener('click', this.#checkAnswer.bind(this));
  }

  async #startQuiz(e) {
    try {
      e.preventDefault();
      const formData = Object.fromEntries([...new FormData(form)]);
      if (!formData.amount) throw new Error('Number of questions must be between 1 to 50');

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
}

const quizApp = new QuizApp();
