document.addEventListener("DOMContentLoaded", function () {
  const user = requireAuth();
  const result = getUserResult(user.email);

  document.getElementById("user-email").textContent = user.email;

  renderResult("essay-score", result.essay, null);
  renderResult("chemistry-score", result.chemistry, 36);
  renderResult("language-score", result.language, 24);
  renderResult("math-score", result.math, 3);
  renderResult("beelogy-score", result.beelogy, 36);

  const finalStatus = document.getElementById("final-status");
  finalStatus.textContent = getFinalStatus(result);
});

function renderResult(elementId, value, minValue) {
  const element = document.getElementById(elementId);

  if (value === null || value === undefined) {
    element.textContent = "не пройдено";
    element.className = "score-wait";
    return;
  }

  element.textContent = value;
  element.className = getScoreClass(value, minValue);
}

function getFinalStatus(result) {
  if (
    result.essay === "зачёт" &&
    result.chemistry >= 36 &&
    result.language >= 24 &&
    result.math >= 3 &&
    result.beelogy >= 36
  ) {
    return "Экзамен сдан. Кандидат допущен к улью.";
  }

  if (result.essay === "ожидает проверки") {
    return "Ожидается проверка сочинения.";
  }

  return "Экзамен не завершён или не сдан.";
}