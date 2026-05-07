const calendarOpenBtn = document.getElementById("calendarOpenBtn");
const calendarCloseBtn = document.getElementById("calendarCloseBtn");
const calendarModal = document.getElementById("calendarModal");
const typeModal = document.getElementById("typeModal");
const basementTypeBtn = document.getElementById("basementTypeBtn");
const typeCancelBtn = document.getElementById("typeCancelBtn");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const monthLabel = document.getElementById("monthLabel");
const calendarYear = document.getElementById("calendarYear");
const calendarGrid = document.getElementById("calendarGrid");
const pageSlider = document.getElementById("pageSlider");
const pageDots = document.getElementById("pageDots");

const recordPageTemplate = document.getElementById("recordPageTemplate");
const plusPageTemplate = document.getElementById("plusPageTemplate");
const garageBundleTemplate = document.getElementById("garageBundleTemplate");
const pipeGroupTemplate = document.getElementById("pipeGroupTemplate");
const pkRowTemplate = document.getElementById("pkRowTemplate");

let viewDate = new Date();
let selectedDate = null;
let pageCount = 0;

function ymd(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function parseNum(value){
  const num = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function formatNumber(value){
  const raw = String(value ?? "").replace(/,/g, "");
  if(raw === "" || raw === "-" || Number.isNaN(Number(raw))) return "";
  return Number(raw).toLocaleString("ko-KR", {maximumFractionDigits: 3});
}

function renderCalendar(){
  calendarGrid.innerHTML = "";
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  calendarYear.textContent = `${y}년`;
  monthLabel.textContent = `${y}년 ${m+1}월`;
  const today = ymd(new Date());
  const first = new Date(y,m,1);
  const startDay = first.getDay();
  const gridStart = new Date(y, m, 1 - startDay);

  for(let i=0;i<42;i++){
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const key = ymd(date);
    const btn = document.createElement("button");
    btn.className = "day";
    btn.textContent = date.getDate();
    if(date.getDay() === 0) btn.classList.add("sunday");
    if(date.getMonth() !== m) btn.classList.add("other-month");
    if(key === today) btn.classList.add("today");
    if(key === selectedDate) btn.classList.add("selected");
    btn.onclick = () => {
      selectedDate = key;
      viewDate = new Date(date);
      selectedDateLabel.textContent = selectedDate;
      closeCalendar();
      renderCalendar();
    };
    calendarGrid.appendChild(btn);
  }
}

function openCalendar(){ renderCalendar(); calendarModal.classList.remove("hidden"); }
function closeCalendar(){ calendarModal.classList.add("hidden"); }
function openTypeModal(){ typeModal.classList.remove("hidden"); }
function closeTypeModal(){ typeModal.classList.add("hidden"); }

function renderPlusPage(){
  const node = plusPageTemplate.content.cloneNode(true);
  node.querySelector(".plus-page-btn").onclick = openTypeModal;
  pageSlider.appendChild(node);
}

function refreshDots(){
  const total = pageSlider.children.length;
  const current = Math.round(pageSlider.scrollLeft / pageSlider.clientWidth);
  pageDots.innerHTML = "";
  for(let i=0;i<total;i++){
    const dot = document.createElement("span");
    dot.className = "dot" + (i===current ? " active" : "");
    pageDots.appendChild(dot);
  }
}

function addRecordPage(){
  const plus = pageSlider.querySelector(".plus-page");
  if(plus) plus.remove();
  pageCount += 1;
  const node = recordPageTemplate.content.cloneNode(true);
  const page = node.querySelector(".record-page");
  const count = node.querySelector(".page-count");
  const bundles = node.querySelector(".garage-bundles");
  count.textContent = `${pageCount}페이지`;
  pageSlider.appendChild(node);
  addGarageBundle(bundles);
  renderPlusPage();
  closeTypeModal();
  setTimeout(() => {
    page.scrollIntoView({behavior:"smooth", inline:"start", block:"nearest"});
    refreshDots();
  }, 30);
}

function refreshBundleButtons(bundles){
  const deletes = bundles.querySelectorAll(".bundle-delete-btn");
  deletes.forEach((btn, idx) => {
    btn.classList.toggle("is-hidden", idx === 0);
  });
}

function refreshPipeButtons(pipeGroups){
  const deletes = pipeGroups.querySelectorAll(".pipe-delete-btn");
  deletes.forEach((btn, idx) => {
    btn.classList.toggle("is-hidden", idx === 0);
  });
}

function addGarageBundle(bundles){
  const node = garageBundleTemplate.content.cloneNode(true);
  const bundle = node.querySelector(".garage-bundle");
  const pipeGroups = node.querySelector(".pipe-groups");
  node.querySelector(".bundle-plus-btn").onclick = () => addGarageBundle(bundles);
  node.querySelector(".bundle-delete-btn").onclick = () => {
    const all = bundles.querySelectorAll(".garage-bundle");
    if (all.length > 1) bundle.remove();
    refreshBundleButtons(bundles);
  };
  bundles.appendChild(node);
  addPipeGroup(pipeGroups);
  refreshBundleButtons(bundles);
}

function addPipeGroup(pipeGroups){
  const node = pipeGroupTemplate.content.cloneNode(true);
  const group = node.querySelector(".pipe-group");
  const pkRows = node.querySelector(".pk-rows");
  node.querySelector(".pipe-plus-btn").onclick = () => addPipeGroup(pipeGroups);
  node.querySelector(".pipe-delete-btn").onclick = () => {
    const all = pipeGroups.querySelectorAll(".pipe-group");
    if (all.length > 1) group.remove();
    refreshPipeButtons(pipeGroups);
  };
  node.querySelector(".add-pk-btn").onclick = () => addPkRow(pkRows);
  pipeGroups.appendChild(node);
  addPkRow(pkRows);
  refreshPipeButtons(pipeGroups);
}

function addPkRow(pkRows){
  const node = pkRowTemplate.content.cloneNode(true);
  const start = node.querySelector(".start-value");
  const end = node.querySelector(".end-value");
  const total = node.querySelector(".total-value");
  const del = node.querySelector(".pk-delete-btn");

  function calc(){
    const result = Math.abs(parseNum(start.value) - parseNum(end.value));
    total.value = result ? formatNumber(result) : "";
  }

  function prettyInput(e){
    e.currentTarget.value = formatNumber(e.currentTarget.value);
    calc();
  }

  start.addEventListener("input", calc);
  end.addEventListener("input", calc);
  start.addEventListener("blur", prettyInput);
  end.addEventListener("blur", prettyInput);
  total.onclick = () => addPkRow(pkRows);
  del.onclick = () => {
    const all = pkRows.querySelectorAll(".pk-row");
    if (all.length > 1) del.closest(".pk-row").remove();
  };
  pkRows.appendChild(node);
}

document.getElementById("prevMonth").onclick = () => { viewDate.setMonth(viewDate.getMonth()-1); renderCalendar(); };
document.getElementById("nextMonth").onclick = () => { viewDate.setMonth(viewDate.getMonth()+1); renderCalendar(); };
calendarOpenBtn.onclick = openCalendar;
calendarCloseBtn.onclick = closeCalendar;
document.getElementById("calendarXBtn").onclick = closeCalendar;
document.querySelector(".modal-backdrop").onclick = closeCalendar;
document.querySelector(".type-backdrop").onclick = closeTypeModal;
typeCancelBtn.onclick = closeTypeModal;
basementTypeBtn.onclick = addRecordPage;
pageSlider.addEventListener("scroll", () => requestAnimationFrame(refreshDots));

selectedDate = ymd(new Date());
selectedDateLabel.textContent = selectedDate;
renderPlusPage();
renderCalendar();
refreshDots();

document.addEventListener("gesturestart", e => e.preventDefault(), {passive:false});
document.addEventListener("gesturechange", e => e.preventDefault(), {passive:false});
document.addEventListener("gestureend", e => e.preventDefault(), {passive:false});
let lastTouchEnd = 0;
document.addEventListener("touchend", function(e){
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, {passive:false});
