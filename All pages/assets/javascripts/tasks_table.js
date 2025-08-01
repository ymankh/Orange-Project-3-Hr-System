import { createTable, filterTable } from "./table_maker.js";

let table = document.querySelector("#tasks-table");
let filter;
let data;

// Default table heading, you can change them if you please.
let table_heading = [
  ["ID", "id"],
  ["Title", "taskTitle"],
  ["Description", "description"],
  ["Due Date", "dueDate"],
  ["Status", "status"],
];

// Get the data from the json file.
async function getData() {
  if (!data) {
    data = JSON.parse(localStorage.getItem("tasks"));
  }
}

await getData();

// For getting the filter key word from the user and filter the table
let filterInput = document.getElementById("filter");
try {
  filterInput.addEventListener("input", (e) => {
    filter = filterInput.value.toLowerCase();
    filterTable(filter);
  });
} catch (error) {
  console.warn("Couldn't find the filter for the table.");
}

// Add data to the table in the start of the code
createTable(table, data, table_heading);
