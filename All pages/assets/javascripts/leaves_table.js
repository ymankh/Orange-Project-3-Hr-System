import { createTable, filterTable } from "./table_maker.js";

let table = document.querySelector("#leaves-table");
let filter;
let leavesWithEmployeesData = [];
const url = "assets/data/employees_data.json";
let leaves = (localStorage.leaves && JSON.parse(localStorage.leaves)) || [];
let employeeData;

// Change the this array to change the table columns
let tableHeadings = [
  ["Employee", "Full Name"],
  ["Leave Type", "leaveType"],
  ["Reason", "reason"],
  ["Start Date", "startDate"],
  ["End Date", "endDate"],
];

async function getEmployeeData() {
    if (!employeeData) {
        const response = await fetch(url);
        employeeData = await response.json();
    }
}

async function margeEmployeeDataWithLeaves() {
    leavesWithEmployeesData = []; // Clear the array before merging
    if (!employeeData) {
        await getEmployeeData();
    }
    for (const leave of leaves) {
        const employee = employeeData.find(
            (employee) => employee["Employee ID"] === leave["employeeId"]
        );
        // Merge the employee data with the leave application
        leavesWithEmployeesData.push({
            ...leave,
            ...employee,
        });
    }
}

async function populateLeavesData() {
  await margeEmployeeDataWithLeaves();
  createTable(table, leavesWithEmployeesData, tableHeadings);
}

await populateLeavesData();

// For getting the filter key word from the user and filter the table
let filterInput = document.getElementById("filter");
try {
  filterInput.addEventListener("input", (e) => {
    filter = filterInput.value.toLowerCase();
    filterTable(table, filter);
  });
} catch (error) {
  console.warn("Couldn't find the filter for the table.");
}
