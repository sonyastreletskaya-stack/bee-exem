document.addEventListener("DOMContentLoaded", async function () {
  const user = await requireAuth();

  if (!user) return;

  const statusBox = document.getElementById("essay-result-status");
  const contentBox = document.getElementById("essay-result-content");

  const { data: essay, error } = await supabaseClient
    .from("essays")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    statusBox.textContent = "Ошибка загрузки сочинения: " + error.message;
    return;
  }

  if (!essay) {
    statusBox.textContent = "Сочинение ещё не отправлено.";
    return;
  }

  const isChecked =
    essay.status !== "ожидает проверки" &&
    essay.status !== null &&
    essay.status !== undefined;

  const hasScore =
    essay.score !== null &&
    essay.score !== undefined;

  if (!isChecked && !hasScore) {
    statusBox.textContent = "Сочинение отправлено, но ещё не проверено.";
    return;
  }

  statusBox.textContent = "Сочинение проверено.";
  contentBox.style.display = "block";

  document.getElementById("essay-nickname").textContent =
    essay.nickname || user.user_metadata?.nickname || "—";

  document.getElementById("essay-email").textContent =
    essay.email || user.email;

  document.getElementById("essay-score").textContent =
    hasScore ? essay.score : "—";

  document.getElementById("essay-status").textContent =
    essay.status || "проверено";

  document.getElementById("essay-text").textContent =
    essay.text || "Текст сочинения не найден.";

  document.getElementById("essay-comment").textContent =
    essay.comment && essay.comment.trim()
      ? essay.comment
      : "Комментарий проверяющего не указан.";
});