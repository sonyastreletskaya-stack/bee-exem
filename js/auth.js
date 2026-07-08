async function registerUser(event) {
  event.preventDefault();

  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const agreement = document.getElementById("personal-data-agree").checked;

  if (!nickname) {
    alert("Укажите ник участника.");
    return;
  }

  if (nickname.length < 2) {
    alert("Ник слишком короткий.");
    return;
  }

  if (!email || !password) {
    alert("Заполните почту и пароль.");
    return;
  }

  if (password.length < 6) {
    alert("Пароль должен быть минимум 6 символов.");
    return;
  }

  if (!agreement) {
    alert("Для регистрации нужно согласие на обработку персональных данных.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        nickname: nickname,
        personal_data_agree: true
      }
    }
  });

  if (error) {
    alert("Ошибка регистрации: " + error.message);
    return;
  }

  alert("Регистрация создана. Теперь войдите в систему.");
  window.location.href = "login.html";
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Введите почту и пароль.");
    return;
  }

  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => button.disabled = true);

  const loginButton = event.target;
  const oldText = loginButton.textContent;
  loginButton.textContent = "Вход в систему...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    buttons.forEach(button => button.disabled = false);
    loginButton.textContent = oldText;
    alert("Ошибка входа: " + error.message);
    return;
  }

  window.location.href = "dashboard.html";
}

async function createResultIfMissing() {
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    return;
  }

  const user = userData.user;
  const nickname = user.user_metadata?.nickname || "";

  const { data: existingResult, error: selectError } = await supabaseClient
    .from("results")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    console.log(selectError);
    return;
  }

  if (!existingResult) {
    const { error: insertError } = await supabaseClient
      .from("results")
      .insert({
        user_id: user.id,
        email: user.email,
        nickname: nickname,
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
      console.log(insertError);
    }
  }
}