function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const dataHeader = [
    "Task Title",
    "Status",
    "Priority",
    "Start Date",
    "Due Date",
    "Description",
    "Assigned To",
  ];
  const dataBody = tasks.map((task) => [
    task.taskTitle,
    task.status,
    task.priority,
    task.startDate,
    task.dueDate,
    task.description,
    task.assignMembersSelect.join(", "),
  ]);

  const data = [dataHeader, ...dataBody];

  doc.autoTable({
    head: [data[0]],
    body: data.slice(1),
  });

  doc.save("TaskData.pdf");
}
