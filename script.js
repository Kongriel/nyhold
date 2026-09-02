// ==========================================
// SUPABASE
// ==========================================

// Find dem i:
// Supabase → Project Settings / Connect / API

const SUPABASE_URL = "https://lmkjvltqiqelkdvjnpyw.supabase.co";
const SUPABASE_KEY = "sb_publishable_gmPWFVBaSbYF2cDVdXLgKA_rXj2XiBL";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// ELEMENTER
// ==========================================

const introView = document.getElementById("introView");
const formView = document.getElementById("formView");
const successView = document.getElementById("successView");

const signupForm = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const birthdayInput = document.getElementById("birthday");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const submitButton = document.getElementById("submitButton");
const submitButtonText = submitButton.querySelector(".button-text");
const submitButtonArrow = submitButton.querySelector(".button-arrow");

const formError = document.getElementById("formError");

// ==========================================
// INTRO → FORM
// ==========================================

const INTRO_DURATION = 4000;

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    switchView(introView, formView);
  }, INTRO_DURATION);
});

// ==========================================
// VIEW SKIFT
// ==========================================

function switchView(currentView, nextView) {
  currentView.classList.add("leaving");

  setTimeout(() => {
    currentView.classList.remove("active", "leaving");
    nextView.classList.add("active");

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, 400);
}

// ==========================================
// TELEFON FORMATERING
// ==========================================

phoneInput.addEventListener("input", () => {
  let numbers = phoneInput.value.replace(/\D/g, "");

  // Maks 8 danske cifre
  numbers = numbers.substring(0, 8);

  const groups = numbers.match(/.{1,2}/g);

  phoneInput.value = groups ? groups.join(" ") : "";
});

// ==========================================
// FJERN ERRORS NÅR MAN RETTER INPUT
// ==========================================

const inputs = [nameInput, birthdayInput, emailInput, phoneInput];

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    const group = input.closest(".form-group");

    group.classList.remove("error");

    hideSubmitError();
  });
});

// ==========================================
// VALIDATION
// ==========================================

function validateName() {
  const name = nameInput.value.trim();

  if (name.length < 2) {
    showError(nameInput);

    return false;
  }

  return true;
}

function validateBirthday() {
  if (!birthdayInput.value) {
    showError(birthdayInput);

    return false;
  }

  const selectedDate = new Date(`${birthdayInput.value}T00:00:00`);

  const today = new Date();

  today.setHours(23, 59, 59, 999);

  if (Number.isNaN(selectedDate.getTime()) || selectedDate > today) {
    showError(birthdayInput);

    return false;
  }

  return true;
}

function validateEmail() {
  const email = emailInput.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showError(emailInput);

    return false;
  }

  return true;
}

function validatePhone() {
  const phone = phoneInput.value.replace(/\D/g, "");

  if (phone.length !== 8) {
    showError(phoneInput);

    return false;
  }

  return true;
}

function showError(input) {
  const group = input.closest(".form-group");

  group.classList.add("error");
}

// ==========================================
// GENEREL FEJL
// ==========================================

function showSubmitError(message) {
  formError.textContent = message;

  formError.classList.add("visible");
}

function hideSubmitError() {
  formError.textContent = "";

  formError.classList.remove("visible");
}

// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {
  submitButton.disabled = isLoading;

  if (isLoading) {
    submitButtonText.textContent = "Sender tilmelding...";

    submitButtonArrow.textContent = "•••";
  } else {
    submitButtonText.textContent = "Tilmeld mig";

    submitButtonArrow.textContent = "→";
  }
}

// ==========================================
// SUBMIT
// ==========================================

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  hideSubmitError();

  // ----------------------------------
  // VALIDATION
  // ----------------------------------

  const nameIsValid = validateName();

  const birthdayIsValid = validateBirthday();

  const emailIsValid = validateEmail();

  const phoneIsValid = validatePhone();

  const formIsValid = nameIsValid && birthdayIsValid && emailIsValid && phoneIsValid;

  if (!formIsValid) {
    const firstError = signupForm.querySelector(".form-group.error input");

    if (firstError) {
      firstError.focus();

      firstError.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return;
  }

  // ----------------------------------
  // DATA
  // ----------------------------------

  const signupData = {
    name: nameInput.value.trim(),

    birthday: birthdayInput.value,

    email: emailInput.value.trim().toLowerCase(),

    phone: phoneInput.value.replace(/\D/g, ""),
  };

  // ----------------------------------
  // SEND TIL SUPABASE
  // ----------------------------------

  try {
    setLoading(true);

    const { error } = await supabaseClient.from("trial_signups").insert([signupData]);

    if (error) {
      throw error;
    }

    console.log("Tilmelding gemt:", signupData);

    // ----------------------------------
    // SUCCESS
    // ----------------------------------

    signupForm.reset();

    switchView(formView, successView);
  } catch (error) {
    console.error("Supabase fejl:", error);

    showSubmitError("Der skete en fejl med din tilmelding. Prøv igen.");
  } finally {
    setLoading(false);
  }
});
