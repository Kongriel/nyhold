// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://lmkjvltqiqelkdvjnpyw.supabase.co";

const SUPABASE_KEY = "sb_publishable_gmPWFVBaSbYF2cDVdXLgKA_rXj2XiBL";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// ELEMENTER
// ==========================================

const loginView = document.getElementById("loginView");

const dashboardView = document.getElementById("dashboardView");

const loginForm = document.getElementById("loginForm");

const loginEmail = document.getElementById("loginEmail");

const loginPassword = document.getElementById("loginPassword");

const loginButton = document.getElementById("loginButton");

const loginButtonText = document.querySelector(".login-button-text");

const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");

const csvButton = document.getElementById("csvButton");

const refreshButton = document.getElementById("refreshButton");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const signupsList = document.getElementById("signupsList");

const loadingState = document.getElementById("loadingState");

const emptyState = document.getElementById("emptyState");

const dataError = document.getElementById("dataError");

const totalCount = document.getElementById("totalCount");

const participatedCount = document.getElementById("participatedCount");

const noShowCount = document.getElementById("noShowCount");

const forwardedCount = document.getElementById("forwardedCount");

const resultCount = document.getElementById("resultCount");

// ==========================================
// DATA
// ==========================================

let signups = [];

// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLogin();

    return;
  }

  await verifyAdminAndLoad();
});

// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  hideLoginError();

  setLoginLoading(true);

  const email = loginEmail.value.trim().toLowerCase();

  const password = loginPassword.value;

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    await verifyAdminAndLoad();
  } catch (error) {
    console.error("Login fejl:", error);

    showLoginError("Email eller adgangskode er forkert.");
  } finally {
    setLoginLoading(false);
  }
});

// ==========================================
// ADMIN CHECK
// ==========================================

async function verifyAdminAndLoad() {
  try {
    const { data: isAdmin, error } = await supabaseClient.rpc("is_current_user_admin");

    if (error) {
      throw error;
    }

    if (!isAdmin) {
      await supabaseClient.auth.signOut();

      showLogin();

      showLoginError("Din bruger har ikke adgang til admin.");

      return;
    }

    showDashboard();

    await loadSignups();
  } catch (error) {
    console.error("Admin-check fejl:", error);

    await supabaseClient.auth.signOut();

    showLogin();

    showLoginError("Kunne ikke bekræfte admin-adgang.");
  }
}

// ==========================================
// VIEW
// ==========================================

function showLogin() {
  dashboardView.classList.add("hidden");

  loginView.classList.remove("hidden");
}

function showDashboard() {
  loginView.classList.add("hidden");

  dashboardView.classList.remove("hidden");
}

// ==========================================
// LOGIN UI
// ==========================================

function setLoginLoading(isLoading) {
  loginButton.disabled = isLoading;

  loginButtonText.textContent = isLoading ? "Logger ind..." : "Log ind";
}

function showLoginError(message) {
  loginError.textContent = message;

  loginError.classList.add("visible");
}

function hideLoginError() {
  loginError.textContent = "";

  loginError.classList.remove("visible");
}

// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();

  signups = [];

  loginForm.reset();

  showLogin();
});

// ==========================================
// LOAD SIGNUPS
// ==========================================

async function loadSignups() {
  setDataLoading(true);

  try {
    const { data, error } = await supabaseClient.from("trial_signups").select("*").order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    signups = data || [];

    renderStats();

    applyFilters();
  } catch (error) {
    console.error("Kunne ikke hente tilmeldinger:", error);

    dataError.classList.remove("hidden");
  } finally {
    setDataLoading(false);
  }
}

// ==========================================
// LOADING
// ==========================================

function setDataLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove("hidden");

    emptyState.classList.add("hidden");

    dataError.classList.add("hidden");

    signupsList.innerHTML = "";
  } else {
    loadingState.classList.add("hidden");
  }
}

// ==========================================
// FILTER
// ==========================================

searchInput.addEventListener("input", applyFilters);

statusFilter.addEventListener("change", applyFilters);

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();

  const status = statusFilter.value;

  const filtered = signups.filter((signup) => {
    const matchesStatus = status === "all" || signup.status === status;

    const searchableText = [signup.name, signup.email, signup.phone, preselectionLabel(signup.preselection_sep9), gymnastTypeLabel(signup.gymnast_type), formatExperience(signup), signup.gymnastics_other, signup.injuries_travel_note].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(search);

    return matchesStatus && matchesSearch;
  });

  renderSignups(filtered);
}

// ==========================================
// STATS
// ==========================================

function renderStats() {
  totalCount.textContent = signups.length;

  participatedCount.textContent = signups.filter((signup) => signup.status === "participated").length;

  noShowCount.textContent = signups.filter((signup) => signup.status === "no_show").length;

  forwardedCount.textContent = signups.filter((signup) => signup.status === "forwarded").length;
}

// ==========================================
// RENDER SIGNUPS
// ==========================================

function renderSignups(data) {
  signupsList.innerHTML = "";

  resultCount.textContent = `${data.length} ${data.length === 1 ? "person" : "personer"}`;

  if (data.length === 0) {
    emptyState.classList.remove("hidden");

    return;
  }

  emptyState.classList.add("hidden");

  data.forEach((signup) => {
    const row = document.createElement("article");

    row.className = "signup-row";

    const age = calculateAge(signup.birthday);

    const preselection = preselectionLabel(signup.preselection_sep9);

    const gymnastType = gymnastTypeLabel(signup.gymnast_type);

    const experience = formatExperience(signup);

    const experienceNote = signup.gymnastics_other || "—";

    const injuriesTravel = signup.injuries_travel_note || "—";

    row.innerHTML = `

        <!-- =====================================
             MOBIL: SAMMENKLAPPET HEADER
        ====================================== -->

        <button
          class="mobile-signup-toggle"
          type="button"
          aria-expanded="false"
        >

          <div class="mobile-person-info">

            <div class="person-name">

              ${escapeHtml(signup.name)}

            </div>

            <span class="person-age">

              ${age} år

            </span>

          </div>


          <span
            class="mobile-toggle-arrow"
            aria-hidden="true"
          >
            ↓
          </span>

        </button>


        <!-- =====================================
             DESKTOP: PERSON
        ====================================== -->

        <div
          class="
            person-main
            desktop-person
          "
        >

          <div>

            <div class="person-name">

              ${escapeHtml(signup.name)}

            </div>

            <span class="person-age">

              ${age} år

            </span>

          </div>

        </div>


        <!-- =====================================
             DETALJER
        ====================================== -->

        <div class="signup-details">


          <!-- KONTAKT -->

          <div class="mobile-detail">

            <span class="detail-label">
              Kontakt
            </span>


            <div
              class="
                detail-value
                contact-links
              "
            >

              <a
                href="mailto:${escapeHtml(signup.email)}"
              >

                ${escapeHtml(signup.email)}

              </a>


              <a
                href="tel:+45${escapeHtml(signup.phone)}"
              >

                ${formatPhone(signup.phone)}

              </a>

            </div>

          </div>


          <!-- FØDSELSDAG -->

          <div class="mobile-detail">

            <span class="detail-label">
              Fødselsdag
            </span>


            <div class="detail-value">

              ${formatDate(signup.birthday)}

            </div>

          </div>


          <!-- GYMNASTIK -->

          <div class="mobile-detail">

            <span class="detail-label">
              Gymnastik
            </span>


            <div
              class="
                detail-value
                gymnastics-details
              "
            >


              <!-- FØRUDTAGELSE -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Førudtagelse:
                </strong>

                <span>

                  ${escapeHtml(preselection)}

                </span>

              </div>


              <!-- GYMNASTTYPE -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Type:
                </strong>

                <span>

                  ${escapeHtml(gymnastType)}

                </span>

              </div>


              <!-- SENESTE 5 ÅR -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Seneste 5 år:
                </strong>

                <span>

                  ${escapeHtml(experience)}

                </span>

              </div>


              <!-- UDDYBNING -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Uddybning:
                </strong>

                <span>

                  ${escapeHtml(experienceNote)}

                </span>

              </div>


              <!-- SKADER / REJSER -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Skader/rejser:
                </strong>

                <span>

                  ${escapeHtml(injuriesTravel)}

                </span>

              </div>


              <!-- TILMELDT -->

              <div
                class="
                  gymnastics-detail-line
                "
              >

                <strong>
                  Tilmeldt:
                </strong>

                <span>

                  ${formatDateTime(signup.created_at)}

                </span>

              </div>

            </div>

          </div>


          <!-- STATUS -->

          <div class="mobile-detail">

            <span class="detail-label">
              Status
            </span>


            <select
              class="status-select"
              data-id="${signup.id}"
              aria-label="Status for ${escapeHtml(signup.name)}"
            >

              ${createStatusOptions(signup.status)}

            </select>

          </div>

        </div>

      `;

    signupsList.appendChild(row);
  });

  addAccordionListeners();

  addStatusListeners();
}

// ==========================================
// MOBILE ACCORDION
// ==========================================

function addAccordionListeners() {
  const toggles = document.querySelectorAll(".mobile-signup-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const row = toggle.closest(".signup-row");

      const isOpen = row.classList.toggle("open");

      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}

// ==========================================
// FØRUDTAGELSE LABEL
// ==========================================

function preselectionLabel(value) {
  if (value === true) {
    return "Ja";
  }

  if (value === false) {
    return "Nej";
  }

  return "—";
}

// ==========================================
// GYMNASTTYPE LABEL
// ==========================================

function gymnastTypeLabel(type) {
  const labels = {
    full_year: "Helårsgymnast",

    autumn_tourist: "Efterårsturist",

    spring_tourist: "Forårsturist",
  };

  return labels[type] || type || "—";
}

// ==========================================
// GYMNASTIKERFARING
// ==========================================

function formatExperience(signup) {
  const experience = signup.gymnastics_last_5_years;

  if (!Array.isArray(experience) || experience.length === 0) {
    return "—";
  }

  return experience.join(", ");
}

// ==========================================
// STATUS OPTIONS
// ==========================================

function createStatusOptions(currentStatus) {
  const statuses = [
    {
      value: "registered",

      label: "Tilmeldt",
    },

    {
      value: "participated",

      label: "Deltog",
    },

    {
      value: "cancelled",

      label: "Afbud",
    },

    {
      value: "no_show",

      label: "Udeblev",
    },

    {
      value: "forwarded",

      label: "Sendt videre",
    },
  ];

  return statuses
    .map(
      (status) => `

        <option
          value="${status.value}"
          ${status.value === currentStatus ? "selected" : ""}
        >

          ${status.label}

        </option>

      `,
    )
    .join("");
}

// ==========================================
// STATUS CHANGE
// ==========================================

function addStatusListeners() {
  const selects = document.querySelectorAll(".status-select");

  selects.forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.dataset.id;

      const newStatus = select.value;

      await updateStatus(id, newStatus, select);
    });
  });
}

async function updateStatus(id, newStatus, selectElement) {
  const signup = signups.find((item) => item.id === id);

  if (!signup) {
    return;
  }

  const oldStatus = signup.status;

  selectElement.disabled = true;

  try {
    const { error } = await supabaseClient
      .from("trial_signups")
      .update({
        status: newStatus,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    signup.status = newStatus;

    renderStats();
  } catch (error) {
    console.error("Status update fejl:", error);

    selectElement.value = oldStatus;

    alert("Kunne ikke ændre status.");
  } finally {
    selectElement.disabled = false;
  }
}

// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener("click", loadSignups);

// ==========================================
// CSV DOWNLOAD
// ==========================================

csvButton.addEventListener("click", downloadCSV);

function downloadCSV() {
  if (signups.length === 0) {
    alert("Der er ingen tilmeldinger at downloade.");

    return;
  }

  const headers = ["Navn", "Fødselsdag", "Alder", "Email", "Telefon", "Førudtagelse 9. september", "Gymnasttype", "Gymnastik seneste 5 år", "Uddybning af gymnastikerfaring", "Skader / længerevarende rejser", "Status", "Admin note", "Tilmeldt", "Senest opdateret"];

  const rows = signups.map((signup) => [signup.name, signup.birthday, calculateAge(signup.birthday), signup.email, signup.phone, preselectionLabel(signup.preselection_sep9), gymnastTypeLabel(signup.gymnast_type), Array.isArray(signup.gymnastics_last_5_years) ? signup.gymnastics_last_5_years.join(", ") : "", signup.gymnastics_other || "", signup.injuries_travel_note || "", statusLabel(signup.status), signup.admin_note || "", formatDateTime(signup.created_at), formatDateTime(signup.updated_at)]);

  const csvRows = [headers, ...rows];

  const csvContent = csvRows.map((row) => row.map(escapeCSV).join(";")).join("\n");

  // UTF-8 BOM:
  // gør æ, ø og å pæne i Excel

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const today = new Date().toISOString().split("T")[0];

  link.href = url;

  link.download = `ny-hold-tilmeldinger-${today}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ==========================================
// CSV ESCAPE
// ==========================================

function escapeCSV(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

// ==========================================
// STATUS LABEL
// ==========================================

function statusLabel(status) {
  const labels = {
    registered: "Tilmeldt",

    participated: "Deltog",

    cancelled: "Afbud",

    no_show: "Udeblev",

    forwarded: "Sendt videre",
  };

  return labels[status] || status || "—";
}

// ==========================================
// FORMAT PHONE
// ==========================================

function formatPhone(phone) {
  if (!phone) {
    return "—";
  }

  const clean = String(phone).replace(/\D/g, "");

  return clean.match(/.{1,2}/g)?.join(" ") || clean;
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("da-DK", {
    day: "2-digit",

    month: "2-digit",

    year: "numeric",
  });
}

// ==========================================
// FORMAT DATE + TIME
// ==========================================

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString("da-DK", {
    day: "2-digit",

    month: "2-digit",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  });
}

// ==========================================
// CALCULATE AGE
// ==========================================

function calculateAge(birthday) {
  if (!birthday) {
    return "";
  }

  const birthDate = new Date(`${birthday}T00:00:00`);

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const month = today.getMonth() - birthDate.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}
