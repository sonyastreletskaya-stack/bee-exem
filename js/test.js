let currentQuestions = [];
let testStartTime = null;
let timerInterval = null;

const subjectNames = {
  chemistry: "Химия ульев",
  language: "Пчелиный язык",
  math: "Математика базовая",
  beelogy: "Пчелология"
};

function startTimer() {
  testStartTime = Date.now();

  const timerElement = document.getElementById("timer");

  if (!timerElement) return;

  timerInterval = setInterval(function () {
    const seconds = Math.floor((Date.now() - testStartTime) / 1000);
    timerElement.textContent = `Время выполнения: ${formatTime(seconds)}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  return Math.floor((Date.now() - testStartTime) / 1000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} мин. ${seconds.toString().padStart(2, "0")} сек.`;
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const user = await requireAuth();

    if (!user) return;

    const subject = document.body.dataset.test;

    if (!subject) {
      document.getElementById("test-title").textContent = "Ошибка: не указан предмет теста.";
      return;
    }

    if (!subjectNames[subject]) {
      document.getElementById("test-title").textContent = "Ошибка: тест не найден.";
      return;
    }

    document.getElementById("test-title").textContent = subjectNames[subject];

    const { data: result, error: resultError } = await supabaseClient
      .from("results")
      .select(subject)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resultError) {
      document.getElementById("test-title").textContent =
        "Ошибка проверки попытки: " + resultError.message;
      return;
    }

    if (result && result[subject] !== null && result[subject] !== undefined) {
      const form = document.getElementById("test-form");

      document.getElementById("test-title").textContent = "Экзамен уже пройден";

      form.innerHTML = `
        <div class="official-note">
          Вы уже проходили этот экзамен. Повторная попытка запрещена.
        </div>
        <a class="button" href="dashboard.html">Вернуться в личный кабинет</a>
      `;

      return;
    }

    await loadTest(subject);
  } catch (error) {
    console.error("Ошибка загрузки теста:", error);

    const title = document.getElementById("test-title");
    if (title) {
      title.textContent = "Ошибка загрузки теста. Откройте консоль.";
    }
  }
});

async function loadTest(subject) {
  const { data, error } = await supabaseClient.rpc("get_test_questions", {
    p_subject: subject
  });

  if (error) {
    document.getElementById("test-title").textContent =
      "Ошибка загрузки вопросов: " + error.message;
    return;
  }

  const grouped = {};

  data.forEach((row) => {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] = {
        id: row.question_id,
        text: row.question_text,
        answers: []
      };
    }

    grouped[row.question_id].answers.push({
      id: row.answer_id,
      text: row.answer_text
    });
  });

  currentQuestions = shuffleArray(Object.values(grouped)).slice(0, 20);

  renderTest(subject);
}

function renderTest(subject) {
  const form = document.getElementById("test-form");
  form.innerHTML = "";

  const timerBox = document.createElement("div");
  timerBox.className = "official-note";
  timerBox.id = "timer";
  timerBox.textContent = "Время выполнения: 0 мин. 00 сек.";
  form.appendChild(timerBox);

  currentQuestions.forEach((question, questionIndex) => {
    const questionBox = document.createElement("div");
    questionBox.className = "question";

    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = `${questionIndex + 1}. ${question.text}`;

    questionBox.appendChild(title);

    const shuffledAnswers = shuffleArray(question.answers);

    shuffledAnswers.forEach((answer) => {
      const label = document.createElement("label");
      label.className = "answer";

      label.innerHTML = `
        <input type="radio" name="question-${questionIndex}" value="${answer.id}">
        ${answer.text}
      `;

      questionBox.appendChild(label);
    });

    form.appendChild(questionBox);
  });

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Завершить экзамен";
  form.appendChild(button);

  form.onsubmit = function (event) {
    event.preventDefault();
    finishTest(subject);
  };

  startTimer();
}

async function finishTest(subject) {
  let unansweredCount = 0;

  const answers = currentQuestions.map((question, questionIndex) => {
    const selected = document.querySelector(`input[name="question-${questionIndex}"]:checked`);

    if (!selected) {
      unansweredCount++;
      return null;
    }

    return {
      question_id: question.id,
      answer_id: selected.value
    };
  }).filter(Boolean);

  if (unansweredCount > 0) {
    const confirmFinish = confirm(
      `Вы не ответили на ${unansweredCount} вопрос(ов). Всё равно завершить экзамен? Повторной попытки не будет.`
    );

    if (!confirmFinish) {
      return;
    }
  }

  const timeSeconds = stopTimer();

  const { data, error } = await supabaseClient.functions.invoke("submit-test", {
    body: {
      subject,
      answers,
      timeSeconds
    }
  });

  if (error) {
    alert("Ошибка отправки теста: " + error.message);
    return;
  }

  if (data.error) {
    alert("Ошибка проверки теста: " + data.error);
    return;
  }

  alert(`Экзамен завершён. Ваш результат: ${data.score}. Время: ${formatTime(data.timeSeconds)}`);
  window.location.href = "dashboard.html";
}