document.addEventListener("DOMContentLoaded", async function () {
  await loadPublicResults();
});

async function loadPublicResults() {
  const waitBox = document.getElementById("results-wait");
  const table = document.getElementById("public-results-table");
  const tbody = document.getElementById("public-results-body");

  const { data, error } = await supabaseClient
    .from("public_results")
    .select("nickname, total_score")
    .order("total_score", { ascending: false });

  if (error) {
    waitBox.textContent = "Ошибка загрузки результатов: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    waitBox.textContent = "Результаты пока не опубликованы.";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatNickname(row.nickname)}</td>
      <td>${row.total_score ?? "—"}</td>
    `;

    tbody.appendChild(tr);
  });

  waitBox.style.display = "none";
  table.style.display = "table";
}
function formatNickname(nickname) {
  if (!nickname) return "Без ника";

  if (nickname.length <= 45) {
    return nickname;
  }

  return nickname.slice(0, 45) + "...";
}