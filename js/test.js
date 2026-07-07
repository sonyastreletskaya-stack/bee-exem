const tests = {
  chemistry: {
    resultKey: "chemistry",
    title: "Химия ульев",
    questions: [
      {
        text: "Что является главным продуктом деятельности улья?",
        answers: ["Бумажная отчётность", "Мёд", "Камень", "Админский бан"],
        correct: 1
      },
      {
        text: "Что происходит при загрязнении улья?",
        answers: ["Мир становится опаснее", "Все получают алмазы", "Пчёлы уходят в отпуск", "Сайт сам обновляется"],
        correct: 0
      },
      {
        text: "Какой эффект логичнее всего связан с кислотным дождём?",
        answers: ["Скорость", "Отравление", "Ночное зрение", "Героизм"],
        correct: 1
      },
      {
        text: "Что нужно делать с опасными механизмами?",
        answers: ["Ставить где попало", "Контролировать загрязнение", "Прятать от администрации", "Молиться"],
        correct: 1
      },
      {
        text: "Что важнее для выживания улья?",
        answers: ["Хаос", "Баланс ресурсов", "Бесконечный спам", "Красивый ник"],
        correct: 1
      }
    ]
  },

  language: {
    resultKey: "language",
    title: "Пчелиный язык",
    questions: [
      {
        text: "Что означает нормальное RP-общение?",
        answers: ["Играть в рамках роли", "Орать в чат капсом", "Ломать сюжет", "Спойлерить всё подряд"],
        correct: 0
      },
      {
        text: "Что лучше всего подходит для общения на сервере?",
        answers: ["Понятные сообщения", "Срач на 40 минут", "Молчание навсегда", "Команды без контекста"],
        correct: 0
      },
      {
        text: "Что нельзя делать в сюжетном проекте?",
        answers: ["Участвовать", "Развивать персонажа", "Руинить другим игру", "Читать правила"],
        correct: 2
      },
      {
        text: "Что такое пчелиный язык в рамках экзамена?",
        answers: ["Понимание лора и правил", "Реальное жужжание", "Команда Minecraft", "Название блока"],
        correct: 0
      },
      {
        text: "Что делает хорошего игрока хорошим?",
        answers: ["Уважение к другим", "Читы", "Дюп", "Постоянные жалобы"],
        correct: 0
      }
    ]
  },

  math: {
    resultKey: "math",
    title: "Математика базовая",
    questions: [
      {
        text: "В улье было 5 пчёл. 2 ушли строить, 1 пишет лор. Сколько пчёл осталось в улье?",
        answers: ["2", "3", "5", "0"],
        correct: 0
      },
      {
        text: "Игрок получил 10 мёда и потратил 4. Сколько осталось?",
        answers: ["6", "14", "4", "0"],
        correct: 0
      },
      {
        text: "Для зачёта нужно минимум 3 балла из 5. Это сколько?",
        answers: ["Меньше половины", "Ровно 3 или больше", "Только 5", "Нисколько"],
        correct: 1
      },
      {
        text: "Если 4 игрока спорят, а 1 строит, сколько реально полезных игроков?",
        answers: ["5", "4", "1", "Ни одного, потому что Discord"],
        correct: 2
      },
      {
        text: "Сколько попыток нужно, чтобы наконец прочитать правила?",
        answers: ["1", "17", "52", "Невозможно"],
        correct: 0
      }
    ]
  },

  beelogy: {
    resultKey: "beelogy",
    title: "Пчелология",
    questions: [
      {
        text: "Что такое GROOXO?",
        answers: ["Сюжетный RP-проект", "Случайный набор букв", "Обычный анархический сервер", "Склад табличек"],
        correct: 0
      },
      {
        text: "Что важно на сюжетном сервере?",
        answers: ["Участие в мире", "Игнорирование всех", "Разрушение спавна", "Дюп ресурсов"],
        correct: 0
      },
      {
        text: "Кто влияет на развитие сюжета?",
        answers: ["Только один админ", "Игроки и их действия", "Случайная корова", "Никто"],
        correct: 1
      },
      {
        text: "Что такое сезон?",
        answers: ["Период развития истории", "Погода", "Баг", "Название предмета"],
        correct: 0
      },
      {
        text: "Что должен делать участник проекта?",
        answers: ["Играть честно и вовлекаться", "Руинить", "Спамить", "Требовать элитры через 3 минуты"],
        correct: 0
      }
    ]
  }
};

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();

  const page = document.body.dataset.test;
  if (!page || !tests[page]) return;

  renderTest(page);
});

function renderTest(testKey) {
  const test = tests[testKey];

  document.getElementById("test-title").textContent = test.title;

  const form = document.getElementById("test-form");
  form.innerHTML = "";

  test.questions.forEach((question, questionIndex) => {
    const questionBox = document.createElement("div");
    questionBox.className = "question";

    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = `${questionIndex + 1}. ${question.text}`;

    questionBox.appendChild(title);

    question.answers.forEach((answer, answerIndex) => {
      const label = document.createElement("label");
      label.className = "answer";

      label.innerHTML = `
        <input type="radio" name="question-${questionIndex}" value="${answerIndex}">
        ${answer}
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
    finishTest(testKey);
  };
}

async function finishTest(testKey) {
  const test = tests[testKey];

  let correctCount = 0;

  test.questions.forEach((question, questionIndex) => {
    const selected = document.querySelector(`input[name="question-${questionIndex}"]:checked`);

    if (selected && Number(selected.value) === question.correct) {
      correctCount++;
    }
  });

  let score;

  if (testKey === "math") {
    score = correctCount;
  } else {
    score = Math.round((correctCount / test.questions.length) * 100);
  }

  await updateUserResult(test.resultKey, score);

  alert(`Экзамен завершён. Ваш результат: ${score}`);
  window.location.href = "dashboard.html";
}