let quizSequence = 0;

export function initQuiz(root) {
  const quizId = ++quizSequence;

  root.querySelectorAll("section[data-quiz-question]").forEach((section, index) => {
    if (section.dataset.quizReady === "true") return;

    const heading = section.querySelector("h2");
    const originalFeedback = section.querySelector("details");
    const options = section.querySelector("ol");
    if (!heading || !originalFeedback) return;

    const answer = section.dataset.correct;
    const orientative = section.hasAttribute("data-orientative");
    const form = document.createElement("form");
    form.className = "quiz-form";
    form.autocomplete = "off";

    const controls = document.createElement("fieldset");
    const legend = document.createElement("legend");
    const fieldId = `quiz-${quizId}-${index + 1}`;
    legend.className = "quiz-sr-only";
    legend.textContent = heading.textContent;
    controls.append(legend);

    if (options) {
      [...options.children].forEach(option => {
        const value = option.dataset.value;
        const label = document.createElement("label");
        label.className = "quiz-choice";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = fieldId;
        radio.value = value;
        radio.required = true;
        label.append(radio, options.type === "A" ? `${value}. ${option.textContent}` : option.textContent);
        controls.append(label);
      });
    } else {
      const label = document.createElement("label");
      label.htmlFor = fieldId;
      label.textContent = "Escribe tu respuesta breve";
      const field = document.createElement("textarea");
      field.id = fieldId;
      field.name = fieldId;
      field.rows = 3;
      field.required = true;
      controls.append(label, field);
    }

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Consultar revisión";
    if (options) button.textContent = orientative ? "Ver orientación" : "Comprobar respuesta";
    button.setAttribute("aria-controls", `${fieldId}-explicacion`);

    const status = document.createElement("p");
    status.className = "quiz-status";
    status.setAttribute("role", "status");

    const explanation = document.createElement("div");
    explanation.id = `${fieldId}-explicacion`;
    explanation.className = "quiz-explanation";
    explanation.hidden = true;
    [...originalFeedback.children]
      .filter(child => child.tagName !== "SUMMARY")
      .forEach(child => explanation.append(child.cloneNode(true)));

    form.addEventListener("submit", event => {
      event.preventDefault();
      const value = String(new FormData(form).get(fieldId) ?? "").trim();
      if (!value) {
        status.textContent = options ? "Elige una opción." : "Escribe tu respuesta antes de revisarla.";
        controls.querySelector("input, textarea")?.focus();
        return;
      }

      if (options && !orientative) {
        status.textContent = value === answer
          ? "Has elegido la opción correcta."
          : "La opción elegida no coincide con la clave.";
      } else if (orientative) {
        status.textContent = "Consulta la opción orientativa.";
      } else {
        status.textContent = "Respuesta preparada para revisión docente.";
      }
      explanation.hidden = false;
    });

    form.addEventListener("input", () => {
      status.textContent = "";
      explanation.hidden = true;
    });

    form.append(controls, button, status, explanation);
    originalFeedback.before(form);
    originalFeedback.hidden = true;
    if (options) options.hidden = true;
    section.dataset.quizReady = "true";
  });
}
