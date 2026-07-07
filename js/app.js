async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

function getScoreClass(value, minValue) {
  if (value === null || value === undefined || value === "не отправлено") {
    return "score-wait";
  }

  if (value === "ожидает проверки") {
    return "score-wait";
  }

  if (value === "зачёт") {
    return "score-good";
  }

  if (value === "незачёт") {
    return "score-bad";
  }

  if (Number(value) >= minValue) {
    return "score-good";
  }

  return "score-bad";
}

async function updateUserResult(subject, score) {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: currentResult, error: selectError } = await supabaseClient
    .from("results")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    alert("Ошибка получения результата: " + selectError.message);
    return;
  }

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (subject === "essay") {
    updateData[subject] = score;
  } else {
    const oldScore = currentResult ? currentResult[subject] : null;

    if (oldScore === null || oldScore === undefined || Number(score) > Number(oldScore)) {
      updateData[subject] = score;
    } else {
      alert(`Новый результат ${score} не выше старого результата ${oldScore}. Сохранён лучший балл.`);
      return;
    }
  }

  const { error } = await supabaseClient
    .from("results")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) {
    alert("Ошибка сохранения результата: " + error.message);
  }
}