document.addEventListener("DOMContentLoaded", async () => {
  const accordion = document.getElementById("accordionExample");
  try {
    const response = await fetch("./Privacy and Policy page/policy.JSON");
    if (!response.ok) throw new Error(`Policy request failed: ${response.status}`);
    const data = await response.json();

    for (const item of data) {
    const collapseId = `collapse${item.id}`;
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    const header = document.createElement("h2");
    header.className = "accordion-header";
    const button = document.createElement("button");
    button.className = "accordion-button collapsed";
    button.type = "button";
    button.dataset.bsToggle = "collapse";
    button.dataset.bsTarget = `#${collapseId}`;
    button.style.fontWeight = "bold";
    button.textContent = item.head;
    header.appendChild(button);
    const collapse = document.createElement("div");
    collapse.id = collapseId;
    collapse.className = "accordion-collapse collapse";
    collapse.dataset.bsParent = "#accordionExample";
    const body = document.createElement("div");
    body.className = "accordion-body";
    const paragraphs = Array.isArray(item.paragraph) ? item.paragraph : [item.paragraph];
    paragraphs.forEach((value) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = value;
      body.appendChild(paragraph);
    });
    collapse.appendChild(body);
    accordionItem.append(header, collapse);
    accordion.appendChild(accordionItem);
    }
  } catch (error) {
    console.error("Unable to load the privacy policy:", error);
    accordion.textContent = "The privacy policy could not be loaded. Please try again later.";
  }
});
