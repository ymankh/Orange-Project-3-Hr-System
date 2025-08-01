// Fill the table with the data.
let table_body;
let table_head;
let data;
let filter;
let table_heading;
let sortOption;

function filterTable(data_filter) {
  filter = data_filter;
  populateData();
}

function createTable(table, table_data, table_headings) {
  if (!table || table.tagName !== "TABLE")
    throw new Error("The provided table is not a table");

  table_body = table.querySelector("tbody");
  table_head = table.querySelector("thead");
  data = table_data;
  table_heading = table_headings;

  createHeadings();
  populateData();
}

function populateData() {
  let i = 1;
  let table_data = data;

  // Filter the data filter word has been provided
  if (filter)
    table_data = data.filter((value) =>
      table_heading
        .map((heading) => value[heading[1]])
        .some((value) => String(value).toLocaleLowerCase().includes(filter))
    );

  // Sort the rows in the table if a search option has been selected
  if (sortOption) {
    table_data.sort((a, b) => {
      let aValue = a[sortOption];
      let bValue = b[sortOption];

      if (sortOption === "Hire Date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  //  clean the table body before inserting the data
  table_body.innerHTML = "";
  table_data.forEach((element) => {
    let tr = document.createElement("tr");
    if (element.id) tr.id = element.id;
    let row = [
      createTd(i),
      ...table_heading.map((heading) => createTd(element[heading[1]])),
    ];
    row.forEach((element) => tr.appendChild(element));
    table_body.appendChild(tr);
    i++;
  });
}

// Create table data cell
function createTd(value) {
  let td = document.createElement("td");
  td.innerText = value;
  return td;
}

// create table heading element
let sortDirection = 'asc';

function createTh(value, sortable) {
  let th = document.createElement("th");
  th.innerText = value[0];
  th.id = value[0];
  th.value = 0;
  if (sortable)
    th.addEventListener("click", (event) => {
      if (sortOption === value[1]) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortDirection = 'asc';
      }
      sortOption = value[1];
      populateData();
      addSortArrow(th);
    });
  return th;
}

function addSortArrow(th) {
  document.querySelectorAll("th i").forEach((element) => {
    element.classList.remove("bi-arrow-up", "bi-arrow-down");
  });
  let icon = th.querySelector("i");
  if (!icon) {
    icon = document.createElement("i");
    th.appendChild(icon);
  }
  icon.classList.add("bi", sortDirection === "asc" ? "bi-arrow-up" : "bi-arrow-down");
}

function createHeadings() {
  let tr = document.createElement("tr");
  table_head.innerHTML = "";
  tr.appendChild(createTh("#"));
  table_heading
    .map((heading) => createTh(heading, true))
    .forEach((th) => {
      tr.appendChild(th);
    });
  table_head.appendChild(tr);
}

export { populateData, createTable, filterTable };
