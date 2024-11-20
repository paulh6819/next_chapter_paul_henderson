let formData = new FormData();
const apiUrl = "https://chatgpt-image-analyser-production.up.railway.app";
// const apiUrl = "http://localhost:3010";

//The two functions below handle the photos uploaded up the user, display them to the UI and prepare them to be sent to the backend
function handleDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  handleFiles(files);
}

function handleImageUploadFromButton(event) {
  const files = event.target.files;
  handleFiles(files);
}
//endpoint
async function sendDataToAIEndPoint() {
  const promtTextInput = document.getElementById("prompt-text").value;

  formData.append("prompt", promtTextInput);

  putPromptInLocalStorage(promtTextInput);

  try {
    const response = await fetch(apiUrl + "/AIAnalysisEndPoint", {
      method: "POST",
      body: formData,
    });

    console.log(response);

    const data = await handleResponse(response);
  } catch (error) {
    console.error("this is the error from the AIEndPoint", error);
  }
}

/////
/////  HELPER FUNCTIONS BELOW THIS POINT
////

function handleFiles(files) {
  const imageArray = createArrayOfImagesFromFileAndUpdateFormData(files);
  updateImage(imageArray);
  displaySendDataButton();
}

function handleDragOver(event) {
  event.preventDefault();
}

function updateImage(imageArray) {
  const container = document.getElementById("display-dropped-photos");
  container.style.border = "dotted 4px black";
  imageArray.forEach((image) => {
    const imgElement = document.createElement("img");
    const objectURL = URL.createObjectURL(image);
    imgElement.src = objectURL;

    imgElement.onload = () => URL.revokeObjectURL(objectURL);

    const div = document.createElement("div");
    div.className = "image-dropped-in";
    div.appendChild(imgElement);
    container.appendChild(div);
  });
}

function createArrayOfImagesFromFileAndUpdateFormData(fileElement) {
  const imageArray = [];
  for (let i = 0; i < fileElement.length; i++) {
    if (fileElement[i].type.match(/^image\//)) {
      console.log("Dropped file:", fileElement[i]);
      formData.append("images", fileElement[i]);
      imageArray.push(fileElement[i]);
    }
  }
  return imageArray;
}

function displaySendDataButton() {
  document.getElementById(
    "div-for-button-to-fetch-data-from-backend"
  ).style.display = "block";
}

async function handleResponse(response) {
  if (response.ok) {
    const data = await response.json();
    console.log("API Response Data:", data[0].message.content);
    const theTestPulledOutOfTheData = data[0].message.content;
    let dataToDisplayInTheUi = "";

    for (let item of data) {
      dataToDisplayInTheUi += item.message.content;
    }
    document.getElementById("result-container").style.display = "block";
    document.getElementById("result-container").innerHTML =
      dataToDisplayInTheUi;

    return data;
  } else {
    throw new Error(`Server responded with status: ${response.status}`);
  }
}
loadSuggestedPromptsIntoLocalStorage();
function loadSuggestedPromptsIntoLocalStorage() {
  const prompt1 =
    "Suggested prompt: Take these Images and return then with descriptive header text. Give the Text css that makes the letters drip and swiral and turn colors. Make sure individual letters fall too. and print out the css at the bottom so i can copy it.";
  putPromptInLocalStorage(prompt1);
}

function putPromptInLocalStorage(uiPromptValue) {
  let prompts = JSON.parse(localStorage.getItem("prompts")) || [];

  if (prompts.includes(uiPromptValue)) {
    console.log("this promt is already in the UI");
  } else {
    prompts.push(uiPromptValue);
  }

  localStorage.setItem("prompts", JSON.stringify(prompts));
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("recentsButton")
    .addEventListener("click", function () {
      const dropdown = document.getElementById("recentsDropdown");
      dropdown.style.display =
        dropdown.style.display === "none" ? "block" : "none";
      dimBackground();
      takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab();
    });
});
function dimBackground() {
  const modal = document.getElementById("dimmed-background");
  modal.style.transition = "opacity 0.5s ease-out";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";
}
function removeimmedBackground() {
  const modal = document.getElementById("dimmed-background");
  modal.style.opacity = "0";
  modal.addEventListener(
    "transitionend",
    function handler() {
      if (modal.style.opacity === "0") {
        modal.style.visibility = "hidden";
      }
      modal.removeEventListener("transitionend", handler);
    },
    { once: true }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const notesButton = document.getElementById("notes-button");
  notesButton.addEventListener("click", function () {
    handleModalForCantAccessNotes();
  });
});

function handleModalForCantAccessNotes() {
  const loginModal = document.getElementById("loginModal");
  loginModal.style.display = "block";
}

function removePrompt(index) {
  let prompts = JSON.parse(localStorage.getItem("prompts")) || [];
  prompts.splice(index, 1);
  localStorage.setItem("prompts", JSON.stringify(prompts));
}

function takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab() {
  const recentPromts = JSON.parse(localStorage.getItem("prompts")) || [];
  const dropdown = document.getElementById("recentsDropdown");
  dropdown.innerHTML = "";
  dropdown.style.zIndex = 100;

  recentPromts.forEach(function (prompt, index) {
    let xOutButton = document.createElement("button");
    xOutButton.innerHTML = "&times";
    xOutButton.classList.add("close-button");
    xOutButton.onclick = function (event) {
      event.stopPropagation();
      removePrompt(index);
      takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab();
    };
    let promptEntry = document.createElement("a");
    promptEntry.textContent = prompt;
    promptEntry.classList.add("prompt-entry");
    promptEntry.href = "#";
    promptEntry.addEventListener("click", function () {
      document.getElementById("prompt-text").value = prompt;
      dropdown.style.display = "none";
      removeimmedBackground();
    });
    promptEntry.appendChild(xOutButton);
    dropdown.appendChild(promptEntry);
  });
}

//look into jsdoc for types
