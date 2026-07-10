const tableStates = new WeakMap();

function filterTable(table, filter) {
  const state = getState(table);
  state.filter = filter;
  populateData(table);
}

function createTable(table, data, headings) {
  if (!table || table.tagName !== "TABLE") {
    throw new Error("The provided table is not a table");
  }

  const previous = tableStates.get(table);
  tableStates.set(table, {
    body: table.querySelector("tbody"),
    head: table.querySelector("thead"),
    data: Array.isArray(data) ? data : [],
    headings,
    filter: previous?.filter || "",
    sortOption: previous?.sortOption || null,
    sortDirection: previous?.sortDirection || "asc",
  });

  createHeadings(table);
  populateData(table);
}

function getState(table) {
  const state = tableStates.get(table);
  if (!state) throw new Error("The table has not been initialized");
  return state;
}

function populateData(table) {
  const state = getState(table);
  let tableData = [...state.data];

  if (state.filter) {
    tableData = tableData.filter((row) =>
      state.headings
        .map((heading) => row[heading[1]])
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(state.filter))
    );
  }

  if (state.sortOption) {
    tableData.sort((left, right) => {
      let leftValue = left[state.sortOption];
      let rightValue = right[state.sortOption];
      if (state.sortOption === "Hire Date") {
        leftValue = new Date(leftValue);
        rightValue = new Date(rightValue);
      }
      const direction = state.sortDirection === "asc" ? 1 : -1;
      return leftValue < rightValue ? -direction : leftValue > rightValue ? direction : 0;
    });
  }

  state.body.replaceChildren();
  if (tableData.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = state.headings.length + 1;
    cell.className = "text-center text-muted py-4";
    cell.textContent = state.filter ? "No matching records found." : "No records available.";
    row.appendChild(cell);
    state.body.appendChild(row);
    return;
  }
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");
    if (row.id !== undefined && row.id !== null) tr.id = row.id;
    [createTd(index + 1), ...state.headings.map((heading) => createTd(row[heading[1]]))]
      .forEach((cell) => tr.appendChild(cell));
    state.body.appendChild(tr);
  });
}

function createTd(value) {
  const td = document.createElement("td");
  td.textContent = value ?? "";
  return td;
}

function createTh(table, heading, sortable = false) {
  const th = document.createElement("th");
  th.textContent = Array.isArray(heading) ? heading[0] : heading;
  if (!sortable) return th;

  th.tabIndex = 0;
  th.setAttribute("role", "button");
  const sort = () => {
    const state = getState(table);
    if (state.sortOption === heading[1]) {
      state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
    } else {
      state.sortDirection = "asc";
    }
    state.sortOption = heading[1];
    populateData(table);
    addSortArrow(table, th);
  };
  th.addEventListener("click", sort);
  th.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sort();
    }
  });
  return th;
}

function addSortArrow(table, activeHeading) {
  const state = getState(table);
  table.querySelectorAll("th i").forEach((icon) => icon.remove());
  const icon = document.createElement("i");
  icon.className = `bi ${state.sortDirection === "asc" ? "bi-arrow-up" : "bi-arrow-down"}`;
  icon.setAttribute("aria-hidden", "true");
  activeHeading.appendChild(icon);
}

function createHeadings(table) {
  const state = getState(table);
  const tr = document.createElement("tr");
  tr.appendChild(createTh(table, "#"));
  state.headings.forEach((heading) => tr.appendChild(createTh(table, heading, true)));
  state.head.replaceChildren(tr);
}

export { populateData, createTable, filterTable };
