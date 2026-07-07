document.addEventListener("DOMContentLoaded", function () {
  renderEssays();
});

function renderEssays() {
  const essays = getEssays();
  const container = document.getElementById("essays-list");

  container.innerHTML = "";

  if (essays.length === 0) {
    container.innerHTML = "<p>Сочинений пока нет.</p>";
    return;
  }

  essays.forEach(essay => {
    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <h3>${essay.email}</h3>
      <p><b>Дата отправки:</b> ${essay.createdAt}</p>
      <p><b>Статус:</b> ${essay.status}</p>
      <div class="admin-essay-text">${essay.text}</div>

      <div class="form-row">
        <label>Комментарий проверяющего</label>
        <textarea id="comment-${essay.id}">${essay.comment || ""}</textarea>
      </div>

      <button onclick="checkEssay(${essay.id}, 'зачёт')">Поставить зачёт</button>
      <button onclick="checkEssay(${essay.id}, 'незачёт')">Поставить незачёт</button>
    `;

    container.appendChild(card);
  });
}

function checkEssay(id, status) {
  const essays = getEssays();
  const essay = essays.find(item => item.id === id);

  if (!essay) return;

  const comment = document.getElementById(`comment-${id}`).value.trim();

  essay.status = status;
  essay.comment = comment;
  essay.checkedAt = new Date().toLocaleString("ru-RU");

  saveEssays(essays);
  updateUserResult(essay.email, "essay", status);

  alert("Результат сочинения сохранён.");
  renderEssays();
}