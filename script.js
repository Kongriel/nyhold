// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://lmkjvltqiqelkdvjnpyw.supabase.co";

const SUPABASE_KEY = "sb_publishable_gmPWFVBaSbYF2cDVdXLgKA_rXj2XiBL";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// ELEMENTER
// ==========================================

// Views
const introView = document.getElementById("introView");

const formView = document.getElementById("formView");

const successView = document.getElementById("successView");

// Form
const signupForm = document.getElementById("signupForm");

// Almindelige inputs
const nameInput = document.getElementById("name");

const birthdayInput = document.getElementById("birthday");

const emailInput = document.getElementById("email");

const phoneInput = document.getElementById("phone");

// Førudtagelse
const preselectionInputs = document.querySelectorAll('input[name="preselection_sep9"]');

// Gymnasttype
const gymnastTypeInputs = document.querySelectorAll('input[name="gymnast_type"]');

// Gymnastikerfaring
const experienceInputs = document.querySelectorAll('input[name="gymnastics_experience"]');

// "Andet" checkbox
const otherExperienceCheckbox = document.getElementById("experienceOtherCheckbox");

// Permanent uddybning af gymnastikerfaring
const gymnasticsOtherInput = document.getElementById("gymnasticsOther");

// Skader / længerevarende rejser
const injuriesTravelInput = document.getElementById("injuriesTravel");

// Submit
const submitButton = document.getElementById("submitButton");

const submitButtonText = submitButton.querySelector(".button-text");

const submitButtonArrow = submitButton.querySelector(".button-arrow");

// Fejl
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

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
});

// ==========================================
// FØRUDTAGELSE
// ==========================================

preselectionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const group = input.closest(".form-group");

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
});

// ==========================================
// GYMNASTTYPE
// ==========================================

gymnastTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const group = input.closest(".form-group");

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
});

// ==========================================
// GYMNASTIKERFARING
// ==========================================

experienceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const group = input.closest(".form-group");

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
});

// ==========================================
// UDDYBNING AF GYMNASTIKERFARING
// ==========================================

if (gymnasticsOtherInput) {
  gymnasticsOtherInput.addEventListener("input", () => {
    const group = gymnasticsOtherInput.closest(".form-group");

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
}

// ==========================================
// SKADER / REJSER
// ==========================================

if (injuriesTravelInput) {
  injuriesTravelInput.addEventListener("input", () => {
    const group = injuriesTravelInput.closest(".form-group");

    if (group) {
      group.classList.remove("error");
    }

    hideSubmitError();
  });
}

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

// ==========================================
// VALIDATION: FØDSELSDAG
// ==========================================

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

// ==========================================
// VALIDATION: EMAIL
// ==========================================

function validateEmail() {
  const email = emailInput.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showError(emailInput);

    return false;
  }

  return true;
}

// ==========================================
// VALIDATION: TELEFON
// ==========================================

function validatePhone() {
  const phone = phoneInput.value.replace(/\D/g, "");

  if (phone.length !== 8) {
    showError(phoneInput);

    return false;
  }

  return true;
}

// ==========================================
// VALIDATION: FØRUDTAGELSE
// ==========================================

function validatePreselection() {
  const selected = document.querySelector('input[name="preselection_sep9"]:checked');

  if (!selected) {
    const firstInput = document.querySelector('input[name="preselection_sep9"]');

    if (firstInput) {
      showError(firstInput);
    }

    return false;
  }

  return true;
}

// ==========================================
// VALIDATION: GYMNASTTYPE
// ==========================================

function validateGymnastType() {
  const selected = document.querySelector('input[name="gymnast_type"]:checked');

  if (!selected) {
    const firstInput = document.querySelector('input[name="gymnast_type"]');

    if (firstInput) {
      showError(firstInput);
    }

    return false;
  }

  return true;
}

// ==========================================
// VALIDATION: ERFARING
// ==========================================

function validateExperience() {
  const selected = document.querySelectorAll('input[name="gymnastics_experience"]:checked');

  if (selected.length === 0) {
    const firstInput = document.querySelector('input[name="gymnastics_experience"]');

    if (firstInput) {
      showError(firstInput);
    }

    return false;
  }

  return true;
}

// ==========================================
// VALIDATION: "ANDET"
// ==========================================
//
// Uddybning er normalt frivillig.
//
// MEN hvis personen vælger checkboxen
// "Andet", skal de skrive hvad det er.
// ==========================================

function validateOtherExperience() {
  if (otherExperienceCheckbox && otherExperienceCheckbox.checked) {
    const value = gymnasticsOtherInput?.value.trim() || "";

    if (value.length < 2) {
      if (gymnasticsOtherInput) {
        showError(gymnasticsOtherInput);
      }

      return false;
    }
  }

  return true;
}

// ==========================================
// VIS ERROR
// ==========================================

function showError(input) {
  if (!input) {
    return;
  }

  const group = input.closest(".form-group");

  if (group) {
    group.classList.add("error");
  }
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
// FIND FØRSTE FEJL
// ==========================================

function scrollToFirstError() {
  const firstErrorGroup = signupForm.querySelector(".form-group.error");

  if (!firstErrorGroup) {
    return;
  }

  firstErrorGroup.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Kan nu både fokusere input,
  // textarea og select

  const firstField = firstErrorGroup.querySelector("input, textarea, select");

  if (firstField) {
    setTimeout(() => {
      firstField.focus({
        preventScroll: true,
      });
    }, 400);
  }
}

// ==========================================
// SUBMIT
// ==========================================

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  hideSubmitError();

  // ----------------------------------
  // FJERN GAMLE FEJL
  // ----------------------------------

  signupForm.querySelectorAll(".form-group.error").forEach((group) => {
    group.classList.remove("error");
  });

  // ----------------------------------
  // VALIDATION
  // ----------------------------------

  const nameIsValid = validateName();

  const birthdayIsValid = validateBirthday();

  const emailIsValid = validateEmail();

  const phoneIsValid = validatePhone();

  const preselectionIsValid = validatePreselection();

  const gymnastTypeIsValid = validateGymnastType();

  const experienceIsValid = validateExperience();

  const otherExperienceIsValid = validateOtherExperience();

  const formIsValid = nameIsValid && birthdayIsValid && emailIsValid && phoneIsValid && preselectionIsValid && gymnastTypeIsValid && experienceIsValid && otherExperienceIsValid;

  if (!formIsValid) {
    showSubmitError("Udfyld venligst alle de markerede felter.");

    scrollToFirstError();

    return;
  }

  // ==================================
  // HENT VALG
  // ==================================

  const preselectionValue = document.querySelector('input[name="preselection_sep9"]:checked').value;

  const gymnastType = document.querySelector('input[name="gymnast_type"]:checked').value;

  const gymnasticsExperience = [...document.querySelectorAll('input[name="gymnastics_experience"]:checked')].map((input) => input.value);

  // ==================================
  // DATA
  // ==================================

  const signupData = {
    name: nameInput.value.trim(),

    birthday: birthdayInput.value,

    email: emailInput.value.trim().toLowerCase(),

    phone: phoneInput.value.replace(/\D/g, ""),

    // Førudtagelse 9. september
    preselection_sep9: preselectionValue === "yes",

    // Helår / efterår / forår
    gymnast_type: gymnastType,

    // Rytme, Spring, Dans, Andet
    gymnastics_last_5_years: gymnasticsExperience,

    // Permanent tekstfelt:
    // uddybning af gymnastikerfaring
    gymnastics_other: gymnasticsOtherInput?.value.trim() || null,

    // Frivilligt felt:
    // skader eller længerevarende rejser
    injuries_travel_note: injuriesTravelInput?.value.trim() || null,
  };

  // ==================================
  // SEND TIL SUPABASE
  // ==================================

  try {
    setLoading(true);

    const { error } = await supabaseClient.from("trial_signups").insert([signupData]);

    if (error) {
      throw error;
    }

    console.log("Tilmelding gemt:", signupData);

    // ==================================
    // RESET FORM
    // ==================================

    signupForm.reset();

    signupForm.querySelectorAll(".form-group.error").forEach((group) => {
      group.classList.remove("error");
    });

    hideSubmitError();

    // ==================================
    // SUCCESS
    // ==================================

    switchView(formView, successView);
  } catch (error) {
    console.error("Supabase fejl:", error);

    showSubmitError("Der skete en fejl med din tilmelding. Prøv igen.");
  } finally {
    setLoading(false);
  }
});
