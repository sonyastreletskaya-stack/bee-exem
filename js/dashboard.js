document.addEventListener("DOMContentLoaded", async function () {
  const user = await requireAuth();

  if (!user) return;

  document.getElementById("user-email").textContent = user.email;
  document.getElementById("user-nickname").textContent =
  user.user_metadata?.nickname || result?.nickname || "—";

  const { data: result, error } = await supabaseClient
    .from("results")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    alert("Ошибка загрузки результатов: " + error.message);
    return;
  }

  if (!result) {
    document.getElementById("final-status").textContent = "Результаты пока не созданы. Выйдите и войдите снова.";
    return;
  }

  document.getElementById("user-nickname").textContent =
  user.user_metadata?.nickname || result.nickname || "—";

  renderResult("essay-score", result.essay, null);
  renderResult("chemistry-score", result.chemistry, 36);
  renderResult("language-score", result.language, 24);
  renderResult("math-score", result.math, 3);
  renderResult("beelogy-score", result.beelogy, 36);
  renderTime("chemistry-time", result.chemistry_time);
  renderTime("language-time", result.language_time);
  renderTime("math-time", result.math_time);
  renderTime("beelogy-time", result.beelogy_time);

  document.getElementById("final-status").textContent = getFinalStatus(result);
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
function renderTime(elementId, seconds) {
  const element = document.getElementById(elementId);

  if (!element) return;

  if (seconds === null || seconds === undefined) {
    element.textContent = "—";
    return;
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  element.textContent = `${minutes} мин. ${restSeconds.toString().padStart(2, "0")} сек.`;
}
