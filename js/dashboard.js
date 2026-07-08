document.addEventListener("DOMContentLoaded", async function () {
  try {
    const user = await requireAuth();

    if (!user) return;

    document.getElementById("user-email").textContent = user.email;

    let { data: result, error } = await supabaseClient
      .from("results")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      document.getElementById("final-status").textContent =
        "Ошибка загрузки результатов: " + error.message;
      return;
    }

    if (!result) {
      const { error: insertError } = await supabaseClient
        .from("results")
        .insert({
          user_id: user.id,
          email: user.email,
          nickname: user.user_metadata?.nickname || "",
          essay: "не отправлено",
          chemistry: null,
          language: null,
          math: null,
          beelogy: null,
          chemistry_time: null,
          language_time: null,
          math_time: null,
          beelogy_time: null
        });

      if (insertError) {
        document.getElementById("final-status").textContent =
          "Ошибка создания строки результатов: " + insertError.message;
        return;
      }

      const response = await supabaseClient
        .from("results")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (response.error) {
        document.getElementById("final-status").textContent =
          "Ошибка повторной загрузки результатов: " + response.error.message;
        return;
      }

      result = response.data;
    }

    document.getElementById("user-nickname").textContent =
      user.user_metadata?.nickname || result.nickname || "—";

    renderResult("essay-score", result.essay_score, 70);
    renderResult("chemistry-score", result.chemistry, 36);
    renderResult("language-score", result.language, 24);
    renderResult("math-score", result.math, 3);
    renderResult("beelogy-score", result.beelogy, 36);

    renderTime("chemistry-time", result.chemistry_time);
    renderTime("language-time", result.language_time);
    renderTime("math-time", result.math_time);
    renderTime("beelogy-time", result.beelogy_time);

    document.getElementById("final-status").textContent = getFinalStatus(result);
  } catch (err) {
    console.error("Критическая ошибка dashboard:", err);

    document.getElementById("final-status").textContent =
      "Критическая ошибка загрузки кабинета. Откройте консоль.";
  }
});

function renderResult(elementId, value, minValue) {
  const element = document.getElementById(elementId);

  if (!element) return;

  if (value === null || value === undefined) {
    element.textContent = "не пройдено";
    element.className = "score-wait";
    return;
  }

  element.textContent = value;
  element.className = getScoreClass(value, minValue);
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

function getFinalStatus(result) {
  if (
    result.essay_score >= 50 &&
    result.chemistry >= 36 &&
    result.language >= 24 &&
    result.math >= 3 &&
    result.beelogy >= 36
  ) {
    return "Экзамен сдан. Кандидат допущен к улью.";
  }

  if (result.essay === "ожидает проверки" || result.essay_score === null || result.essay_score === undefined) {
    return "Ожидается проверка сочинения.";
  }

  return "Экзамен не завершён или не сдан.";
}