const EXAM_CLOSED = true;

if (EXAM_CLOSED) {
  window.location.href = "closed.html";
}

document.addEventListener("DOMContentLoaded", async function () {
  const user = await requireAuth();

  if (!user) return;

  const { data: result, error } = await supabaseClient
    .from("results")
    .select("essay")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    alert("Ошибка проверки сочинения: " + error.message);
    return;
  }

  if (
    result &&
    result.essay &&
    result.essay !== "не отправлено" &&
    result.essay !== null
  ) {
    const form = document.querySelector("form");

    if (form) {
      form.innerHTML = `
        <div class="official-note">
          Сочинение уже отправлено. Повторная попытка запрещена.
        </div>
        <a class="button" href="dashboard.html">Вернуться в личный кабинет</a>
      `;
    }
  }
});

async function submitEssay(event) {
  event.preventDefault();

  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const text = document.getElementById("essay-text").value.trim();

  if (text.length < 100) {
    alert("Сочинение слишком короткое.");
    return;
  }

  const { error: essayError } = await supabaseClient
    .from("essays")
    .insert({
      user_id: user.id,
      email: user.email,
      nickname: user.user_metadata?.nickname || "",
      text: text,
      status: "ожидает проверки"
    });

  if (essayError) {
    alert("Ошибка отправки сочинения: " + essayError.message);
    return;
  }

  const saved = await updateUserResult("essay", "ожидает проверки");

if (!saved) {
  return;
}

alert("Сочинение отправлено на проверку.");
window.location.href = "dashboard.html";
}