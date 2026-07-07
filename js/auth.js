async function registerUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Заполните почту и пароль.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
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

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Ошибка входа: " + error.message);
    return;
  }

  await createResultIfMissing();

  window.location.href = "dashboard.html";
}

async function createResultIfMissing() {
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    return;
  }

  const user = userData.user;

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
        essay: "не отправлено",
        chemistry: null,
        language: null,
        math: null,
        beelogy: null
      });

    if (insertError) {
      console.log(insertError);
    }
  }
}