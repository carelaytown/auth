const supabaseUrl = "https://viihcgkjzzhkdiwdzdex.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...BZ9YM";

let allAccounts = [];

const accountStyle = document.createElement("style");
accountStyle.textContent = `
  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .panel-group {
    background: #ffffff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(0,0,0,0.1);
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .panel-group button {
    padding: 8px 16px;
    border: none;
    background-color: #2a6ebb;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  .panel-group button:hover {
    background-color: #1f5aa0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }
  th, td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }
  th {
    background: #2a6ebb;
    color: white;
  }
  .status-approved {
    color: #27ae60;
    font-weight: bold;
  }
  .status-pending {
    color: #c0392b;
    font-weight: bold;
  }
`;
document.head.appendChild(accountStyle);

window.loadAccountList = async function() {
  const res = await fetch(`${supabaseUrl}/rest/v1/applications?select=*`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  allAccounts = data;
  renderAccounts("all");
};

function renderAccounts(filter) {
  const tbody = document.getElementById("accountTableBody");
  tbody.innerHTML = "";
  const filtered = allAccounts.filter(acc => {
    if (filter === "approved") return acc.status === "approved";
    if (filter === "pending") return acc.status === "pending";
    return true;
  });

  filtered.forEach(acc => {
    const statusClass = acc.status === "approved" ? "status-approved" : "status-pending";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-id="${acc.id}"></td>
      <td>${acc.org_name}</td>
      <td>${acc.email}</td>
      <td class="${statusClass}">${acc.status}</td>
      <td>${acc.is_admin ? "✅" : ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilter(filter) {
  renderAccounts(filter);
}

function toggleAll(source) {
  const checkboxes = document.querySelectorAll("#accountTableBody input[type='checkbox']");
  checkboxes.forEach(cb => cb.checked = source.checked);
}

async function approveSelected() {
  await updateStatus("approved");
}

async function rejectSelected() {
  await updateStatus("pending");
}

async function deleteSelected() {
  const selected = getSelectedIds();
  for (const id of selected) {
    await fetch(`${supabaseUrl}/rest/v1/applications?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
  }
  await window.loadAccountList();
}

async function updateStatus(status) {
  const selected = getSelectedIds();
  for (const id of selected) {
    await fetch(`${supabaseUrl}/rest/v1/applications?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ status })
    });
  }
  await window.loadAccountList();
}

function getSelectedIds() {
  const checkboxes = document.querySelectorAll("#accountTableBody input[type='checkbox']:checked");
  return [...checkboxes].map(cb => cb.dataset.id);
}

// 自動実行
window.loadAccountList();
