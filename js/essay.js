document.addEventListener("DOMContentLoaded", async function () {
  await requireAuth();
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
      text: text,
      status: "ожидает проверки"
    });

  if (essayError) {
    alert("Ошибка отправки сочинения: " + essayError.message);
    return;
  }

  await updateUserResult("essay", "ожидает проверки");

  alert("Сочинение отправлено на проверку.");
  window.location.href = "dashboard.html";
}