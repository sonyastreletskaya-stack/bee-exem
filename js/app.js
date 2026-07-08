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

async function updateUserResult(subject, score, timeSeconds = null) {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return false;
  }

  const { data: currentResult, error: selectError } = await supabaseClient
    .from("results")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    alert("Ошибка получения результата: " + selectError.message);
    return false;
  }

  if (!currentResult) {
    alert("Ошибка: строка результатов не найдена. Перезайдите в личный кабинет.");
    return false;
  }

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (subject === "essay") {
    if (
      currentResult.essay &&
      currentResult.essay !== "не отправлено" &&
      currentResult.essay !== null
    ) {
      alert("Сочинение уже отправлено. Повторная попытка запрещена.");
      return false;
    }

    updateData.essay = score;
  } else {
    const oldScore = currentResult[subject];

    if (oldScore !== null && oldScore !== undefined) {
      alert("Вы уже проходили этот экзамен. Повторная попытка запрещена.");
      return false;
    }

    updateData[subject] = score;

    if (timeSeconds !== null) {
      updateData[`${subject}_time`] = timeSeconds;
    }
  }

  const { error } = await supabaseClient
    .from("results")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) {
    alert("Ошибка сохранения результата: " + error.message);
    return false;
  }

  return true;
}