import { createTable, filterTable } from "./table_maker.js";

let table = document.querySelector("#leaves-table");
let filter;
let data;

// Default table heading, you can change them if you please.
let table_heading = [
  ["Leave ID", "leave_id"],
  ["Employee ID", "employee_id"],
  ["Name", "name"],
  ["Leave Type", "type"],
  ["Start Date", "start_date"],
  ["End Date", "end_date"],
  ["Reason", "reason"],
  ["Approved", "approved"],
];

// Get the data from the json file.
async function getData() {
  if (!data) {
    let response = await fetch("assets/data/leaves.json");
    let leavesData = await response.json();
    data = leavesData.flatMap(employee => 
      employee.leave_records.map(record => ({
        ...record,
        employee_id: employee.employee_id,
        name: employee.name
      }))
    );
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
