function createCard() {
  var entries = demoData.readArray("feedbackEntries");
  var emailToCardsMap = {}; // Map email to an array of cards (if any)
  var feedbackContainer = document.getElementById("feedbackContainer");

  // Clear existing content in feedback container
  feedbackContainer.replaceChildren();

  if (entries.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "text-center text-muted py-5";
    emptyState.textContent = "No feedback has been submitted yet.";
    feedbackContainer.appendChild(emptyState);
    return;
  }

  entries.forEach(function (entry) {
    var email = entry.Email;

    // Check if an existing card already displays feedback from this email
    if (emailToCardsMap[email]) {
      // Append new feedback to the existing card
      var card = emailToCardsMap[email][0]; // Get the first card
      var feedbackText = document.createElement("p");
      const subject = document.createElement("strong");
      subject.textContent = `Subject: ${entry.Subject}`;
      feedbackText.append(subject, document.createElement("br"), entry.Message);
      const textContainer = card.querySelector(".FeedbackText");
      textContainer.appendChild(feedbackText);
      textContainer.style.paddingTop = "30px";
    } else {
      // Create a new card
      var card = document.createElement("div");
      card.className = "FullCard";
      card.tabIndex = 0;
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", `Feedback from ${entry.Name}`);

      // Profile image
      var profileImage = document.createElement("img");
      profileImage.src = entry.Gender === "Female" ? "assets/images/female.jpg" : "assets/images/male.jpg";
      profileImage.alt = "Profile Image";
      card.appendChild(profileImage);

      // Feedback text
      var feedbackText = document.createElement("div");
      feedbackText.className = "FeedbackText";
      const heading = document.createElement("h3");
      const message = document.createElement("p");
      heading.textContent = entry.Subject;
      message.textContent = entry.Message;
      feedbackText.append(heading, message);
      card.appendChild(feedbackText);

      // Card titles
      var cardTitles = document.createElement("div");
      cardTitles.className = "CardTitles";
      const name = document.createElement("p");
      const title = document.createElement("p");
      const email = document.createElement("p");
      const date = document.createElement("p");
      name.textContent = entry.Name;
      title.textContent = entry.Title;
      email.className = "email";
      email.textContent = entry.Email;
      date.className = "dateNN";
      date.textContent = new Date(entry.Date).toLocaleString();
      cardTitles.append(name, title, email, date);
      card.appendChild(cardTitles);

      // Add the card to the feedback container
      feedbackContainer.appendChild(card);

      // Map email to this newly created card
      emailToCardsMap[email] = [card]; // Initialize with an array containing this card
    }
  });
}

// Call createCard to display the feedback cards when the page loads
document.addEventListener("DOMContentLoaded", createCard);


