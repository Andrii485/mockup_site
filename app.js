const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// State
let selectedDay = "Monday";
let weekType = "numerator";

// DOM Elements
const daysGrid = document.getElementById("daysGrid");
const lecturesContainer = document.getElementById("lecturesContainer");
const dayTitle = document.getElementById("dayTitle");
const lectureCount = document.getElementById("lectureCount");
const lecturesList = document.getElementById("lecturesList");
const weekToggle = document.getElementById("weekToggle");
const toggleLabel = document.querySelector(".toggle-label");
const clock = document.getElementById("clock");

// Helper Functions
function getLecturesForDay(day) {
  const lectureCards = document.querySelectorAll(".lecture-card");
  return Array.from(lectureCards).filter(
    (card) => card.dataset.day === day && card.dataset.weektype === weekType
  );
}

function updateClock() {
  const now = new Date();
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Kyiv",
  };
  const optionsDate = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  };
  const time = now.toLocaleString("en-US", optionsTime);
  const date = now.toLocaleString("en-US", optionsDate);
  clock.innerHTML = `
    <span class="time">${time}</span>
    <span class="date">${date}</span>
  `;
}

function renderDaysGrid() {
  daysGrid.innerHTML = "";

  weekDays.forEach((day) => {
    const dayLectures = getLecturesForDay(day);
    const isSelected = selectedDay === day;
    const hasLectures = dayLectures.length > 0;

    const dayButton = document.createElement("button");
    dayButton.className = `day-button ${isSelected ? "selected" : ""}`;
    dayButton.disabled = !hasLectures;

    dayButton.innerHTML = `
      <div class="day-name">${day}</div>
      <div class="lecture-count-badge">
          ${hasLectures ? `${dayLectures.length} лекцій` : "Немає лекцій"}
      </div>
      ${isSelected ? '<div class="selected-ring"></div>' : ""}
    `;

    if (hasLectures) {
      dayButton.addEventListener("click", () => selectDay(day));
    }

    daysGrid.appendChild(dayButton);
  });
}

function renderLectures() {
  const allLectureCards = document.querySelectorAll(".lecture-card");
  const selectedDayLectures = getLecturesForDay(selectedDay);

  // Update header
  dayTitle.textContent = selectedDay;
  lectureCount.textContent = `${selectedDayLectures.length} лекций на сегодня`;

  // Add animation class to container
  lecturesContainer.style.animation = "none";
  lecturesContainer.offsetHeight; // Trigger reflow
  lecturesContainer.style.animation = "containerFadeIn 0.3s ease";

  // Hide all lecture cards
  allLectureCards.forEach((card) => {
    card.classList.add("hidden");
    card.style.animation = "none"; // Reset animation
  });

  // Show and animate relevant lectures
  if (selectedDayLectures.length > 0) {
    selectedDayLectures.forEach((card, index) => {
      card.classList.remove("hidden");
      card.style.animation = `lectureSlideIn 0.5s ease ${index * 0.1}s both`;
    });
  } else {
    lecturesList.innerHTML = `
      <div class="no-lectures">
        <div class="no-lectures-card">
          <div class="no-lectures-text">
            На ${selectedDay.toLowerCase()} нет запланированных лекций
          </div>
        </div>
      </div>
    `;
  }
}

function selectDay(day) {
  if (selectedDay === day) return;

  selectedDay = day;

  // Re-render with animations
  renderDaysGrid();

  // Animate lectures container
  lecturesContainer.style.opacity = "0";
  lecturesContainer.style.transform = "translateY(-20px)";

  setTimeout(() => {
    renderLectures();
    lecturesContainer.style.opacity = "1";
    lecturesContainer.style.transform = "translateY(0)";
  }, 150);
}

// Toggle Week Type
function toggleWeekType() {
  weekType = weekToggle.checked ? "denominator" : "numerator";
  toggleLabel.textContent =
    weekType === "numerator" ? "Чисельник" : "Знаменник";
  renderDaysGrid();
  renderLectures();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Add click handlers to join buttons
  const joinButtons = document.querySelectorAll(".join-button");
  joinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".lecture-card");
      const link = card.dataset.link;
      const subject = card.querySelector(".lecture-details h3").textContent;

      // Animate button
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);

      if (link && link !== "YOUR_LINK_HERE" && isValidUrl(link)) {
        window.open(link, "_blank");
      } else {
        alert(
          `Присоединение к лекции: ${subject} (вставьте корректную ссылку в data-link)`
        );
      }
    });
  });

  renderDaysGrid();
  renderLectures();

  // Add toggle event listener
  weekToggle.addEventListener("change", toggleWeekType);

  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = "smooth";

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    const currentIndex = weekDays.indexOf(selectedDay);
    let newIndex = currentIndex;

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      newIndex = Math.min(weekDays.length - 1, currentIndex + 1);
    }

    if (newIndex !== currentIndex) {
      const newDay = weekDays[newIndex];
      const dayLectures = getLecturesForDay(newDay);
      if (dayLectures.length > 0) {
        selectDay(newDay);
      }
    }
  });

  // Trigger title animation on page load
  const titleLetters = document.querySelectorAll(".title-letter");
  titleLetters.forEach((letter) => {
    letter.style.animation = "none";
    letter.offsetHeight; // Trigger reflow
    letter.style.animation = null; // Reapply animation
  });

  // Update clock every second
  setInterval(updateClock, 1000);
  updateClock();

  // Add touch support for mobile (disabled to prevent automatic day switching)
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    // handleSwipe(); // Commented out to disable swipe day switching
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
      const currentIndex = weekDays.indexOf(selectedDay);
      let newIndex = currentIndex;

      if (diff > 0 && currentIndex < weekDays.length - 1) {
        // Swipe up - next day
        newIndex = currentIndex + 1;
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous day
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        const newDay = weekDays[newIndex];
        const dayLectures = getLecturesForDay(newDay);
        if (dayLectures.length > 0) {
          selectDay(newDay);
        }
      }
    }
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);

// Observe lecture cards
const lectureCards = document.querySelectorAll(".lecture-card");
lectureCards.forEach((card) => observer.observe(card));

// Add hover effects to buttons
function addHoverEffects() {
  document.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("day-button") && !e.target.disabled) {
      e.target.style.transform = "scale(1.05)";
    }

    if (e.target.classList.contains("lecture-card")) {
      e.target.style.transform = "scale(1.02)";
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("day-button")) {
      e.target.style.transform = e.target.classList.contains("selected")
        ? "scale(1)"
        : "scale(1)";
    }

    if (e.target.classList.contains("lecture-card")) {
      e.target.style.transform = "scale(1)";
    }
  });
}

// Initialize hover effects
addHoverEffects();

// Add resize handler for responsive adjustments
window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    document.querySelector(".days-grid").style.gridTemplateColumns =
      "repeat(2, 1fr)";
  } else {
    document.querySelector(".days-grid").style.gridTemplateColumns =
      "repeat(7, 1fr)";
  }
});

// Performance optimization: debounce day selection
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSelectDay = debounce(selectDay, 100);

// Simple URL validation function
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
