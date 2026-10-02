"use strict";

const tabList = document.querySelector(".results-tabs");
const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

function selectTab(selectedTab, moveFocus = false) {
  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
  });
  if (moveFocus) selectedTab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let targetIndex;
    if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = tabs.length - 1;
    if (targetIndex !== undefined) {
      event.preventDefault();
      selectTab(tabs[targetIndex], true);
    }
  });
});
selectTab(tabs[0]);
tabList.hidden = false;

const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector("img");
const dialogTitle = document.getElementById("dialog-title");
let figureTrigger;

document.querySelectorAll(".figure-zoom").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    if (typeof dialog.showModal !== "function") {
      window.open(image.currentSrc || image.src, "_blank", "noopener,noreferrer");
      return;
    }
    figureTrigger = button;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialogTitle.textContent = button.dataset.figureTitle;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.querySelector(".dialog-image-wrap").scrollTo(0, 0);
  });
});

dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (event.target === dialog && outside) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (figureTrigger) figureTrigger.focus({ preventScroll: true });
});

const copyButton = document.getElementById("copy-citation");
const copyLabel = copyButton.querySelector("span");
const copyStatus = document.getElementById("copy-status");
const citation = document.getElementById("bibtex");
let copyTimer;
copyButton.hidden = false;

copyButton.addEventListener("click", async () => {
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(citation.textContent);
    copyLabel.textContent = "Copied!";
    copyStatus.textContent = "BibTeX copied to clipboard.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(citation);
    selection.removeAllRanges();
    selection.addRange(range);
    copyLabel.textContent = "Selected — press Ctrl/Cmd+C";
    copyStatus.textContent = "Copy was unavailable. Citation selected; press Control or Command and C to copy.";
  }
  copyTimer = setTimeout(() => {
    copyLabel.textContent = "Copy BibTeX";
    copyStatus.textContent = "";
  }, 5000);
});

if ("IntersectionObserver" in window) {
  const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-15% 0px -30% 0px", threshold: 0 });
  links.forEach((link) => {
    const section = document.getElementById(link.hash.slice(1));
    if (section) observer.observe(section);
  });
}
