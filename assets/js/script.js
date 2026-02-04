document.addEventListener("DOMContentLoaded", () => {
  // Main inputs
  const dayInput = document.getElementById("day");
  const monthInput = document.getElementById("month");
  const yearInput = document.getElementById("year");
  const calculateBtn = document.getElementById("calculate-btn");
  const resultContainer = document.getElementById("result");
  const errorMessage = document.getElementById("error-message");

  // Calendar Elements
  const calendarModal = document.getElementById("calendar-modal");
  const calendarToggle = document.getElementById("calendar-toggle");
  const calendarClose = document.getElementById("calendar-close");
  const calendarDays = document.getElementById("calendar-days");
  const monthYearDisplay = document.getElementById("calendar-month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const calendarToday = document.getElementById("calendar-today");

  // Selection Views
  const dateView = document.getElementById("calendar-date-view");
  const monthView = document.getElementById("calendar-month-view");
  const yearView = document.getElementById("calendar-year-view");
  const monthsGrid = document.getElementById("calendar-months-grid");
  const yearsGrid = document.getElementById("calendar-years-grid");
  const yearRangeDisplay = document.getElementById("calendar-year-range");
  const prevYearsBtn = document.getElementById("prev-years");
  const nextYearsBtn = document.getElementById("next-years");

  // Result elements
  const yearsEl = document.getElementById("years");
  const monthsEl = document.getElementById("months");
  const daysEl = document.getElementById("days");
  const totalMonthsEl = document.getElementById("total-months");
  const totalWeeksEl = document.getElementById("total-weeks");
  const totalDaysEl = document.getElementById("total-days");
  const totalHoursEl = document.getElementById("total-hours");
  const nextBirthdayEl = document.getElementById("next-birthday-countdown");

  let currentDisplayedDate = new Date();
  let startYearForSelection = 2020;
  const today = new Date();
  const monthsArr = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  yearInput.setAttribute("max", today.getFullYear());

  // --- Core Calculations ---
  function isValidDate(d, m, y) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  function calculateAge() {
    const d = parseInt(dayInput.value);
    const m = parseInt(monthInput.value);
    const y = parseInt(yearInput.value);
    const birthDate = new Date(y, m - 1, d);
    const now = new Date();

    if (!d || !m || !y || !isValidDate(d, m, y) || birthDate > now) {
      showError();
      return;
    }
    hideError();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffInMs = now - birthDate;
    animateValue(yearsEl, years);
    animateValue(monthsEl, months);
    animateValue(daysEl, days);

    totalMonthsEl.textContent = (years * 12 + months).toLocaleString();
    totalWeeksEl.textContent = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)).toLocaleString();
    totalDaysEl.textContent = Math.floor(diffInMs / (1000 * 60 * 60 * 24)).toLocaleString();
    totalHoursEl.textContent = Math.floor(diffInMs / (1000 * 60 * 60)).toLocaleString();

    let nbYear = now.getFullYear();
    if (now.getMonth() > birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() > birthDate.getDate())) nbYear++;
    nextBirthdayEl.textContent = Math.ceil((new Date(nbYear, birthDate.getMonth(), birthDate.getDate()) - now) / (1000 * 60 * 60 * 24));

    resultContainer.classList.remove("hidden");
  }

  function animateValue(obj, endValue) {
    let start = 0;
    const dur = 1000;
    const step = 10;
    const increment = endValue / (dur / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) { obj.textContent = endValue; clearInterval(timer); }
      else obj.textContent = Math.floor(start);
    }, step);
  }

  function showError() { errorMessage.classList.remove("hidden"); resultContainer.classList.add("hidden"); }
  function hideError() { errorMessage.classList.add("hidden"); }

  // --- Calendar Engine ---
  function renderCalendar() {
    calendarDays.innerHTML = "";
    const y = currentDisplayedDate.getFullYear();
    const m = currentDisplayedDate.getMonth();
    monthYearDisplay.textContent = `${monthsArr[m]} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();
    const prevLastDate = new Date(y, m, 0).getDate();

    for (let i = firstDay; i > 0; i--) {
      const d = document.createElement("div"); d.classList.add("prev-date");
      d.textContent = prevLastDate - i + 1; calendarDays.appendChild(d);
    }
    for (let i = 1; i <= lastDate; i++) {
      const d = document.createElement("div");
      if (i === today.getDate() && m === today.getMonth() && y === today.getFullYear()) d.classList.add("current-day");
      if (i === parseInt(dayInput.value) && m + 1 === parseInt(monthInput.value) && y === parseInt(yearInput.value)) d.classList.add("selected");
      d.textContent = i;
      d.addEventListener("click", () => {
        dayInput.value = String(i).padStart(2, "0");
        monthInput.value = String(m + 1).padStart(2, "0");
        yearInput.value = y;
        closeCalendar(); calculateAge();
      });
      calendarDays.appendChild(d);
    }
    const nextDays = 42 - calendarDays.children.length;
    for (let i = 1; i <= nextDays; i++) {
      const d = document.createElement("div"); d.classList.add("next-date");
      d.textContent = i; calendarDays.appendChild(d);
    }
  }

  function renderMonths() {
    monthsGrid.innerHTML = "";
    monthsArr.forEach((m, i) => {
      const d = document.createElement("div"); d.textContent = m.slice(0, 3);
      if (i === currentDisplayedDate.getMonth()) d.classList.add("selected");
      d.addEventListener("click", () => {
        currentDisplayedDate.setMonth(i);
        switchView(dateView); renderCalendar();
      });
      monthsGrid.appendChild(d);
    });
  }

  function renderYears() {
    yearsGrid.innerHTML = "";
    const currentYear = today.getFullYear();
    for (let y = currentYear; y >= 1900; y--) {
      const d = document.createElement("div"); d.textContent = y;
      if (y === currentDisplayedDate.getFullYear()) d.classList.add("selected");
      d.addEventListener("click", () => {
        currentDisplayedDate.setFullYear(y);
        switchView(monthView); renderMonths();
      });
      yearsGrid.appendChild(d);
      if (y === currentDisplayedDate.getFullYear()) {
        setTimeout(() => d.scrollIntoView({ block: "center" }), 10);
      }
    }
  }

  function switchView(view) {
    [dateView, monthView, yearView].forEach(v => v.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  function openCalendar() {
    const d = parseInt(dayInput.value), m = parseInt(monthInput.value), y = parseInt(yearInput.value);
    currentDisplayedDate = (d && m && y && isValidDate(d, m, y)) ? new Date(y, m - 1, 1) : new Date();
    switchView(dateView); renderCalendar();
    calendarModal.classList.remove("hidden");
  }

  function closeCalendar() { calendarModal.classList.add("hidden"); }

  // --- Listeners ---
  calculateBtn.addEventListener("click", calculateAge);
  calendarToggle.addEventListener("click", openCalendar);
  calendarClose.addEventListener("click", closeCalendar);
  
  [dayInput, monthInput, yearInput].forEach(inp => {
    inp.addEventListener("keypress", (e) => {
      if (e.key === "Enter") calculateAge();
    });
  });

  prevMonthBtn.addEventListener("click", () => { currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() - 1); renderCalendar(); });
  nextMonthBtn.addEventListener("click", () => { currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() + 1); renderCalendar(); });

  monthYearDisplay.addEventListener("click", () => {
    switchView(yearView); renderYears();
  });

  calendarToday.addEventListener("click", () => {
    currentDisplayedDate = new Date();
    dayInput.value = String(today.getDate()).padStart(2, "0");
    monthInput.value = String(today.getMonth() + 1).padStart(2, "0");
    yearInput.value = today.getFullYear();
    closeCalendar(); calculateAge();
  });

  calendarModal.addEventListener("click", (e) => { if (e.target === calendarModal) closeCalendar(); });
});
