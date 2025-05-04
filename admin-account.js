// Supabase URLとKeyはwindowオブジェクトから取得
const SUPABASE_URL = window.CARELAY_SUPABASE_URL;
const SUPABASE_KEY = window.CARELAY_SUPABASE_KEY;

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let allAccounts = [];

const style = document.createElement("style");
style.textContent = `
  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 20px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 12px;
    text-align: center;
  }
  th {
    background-color: #f2f2f2;
  }
  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    align-items: center;
  }
  .panel-group {
    display: flex;
    gap: 10px;
  }
  button {
    background-color: #2a6ebb;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover {
    background-color: #1f5aa0;
  }
  .status-approved {
    color: green;
    font-weight: bold;
  }
  .status-pending {
    color: red;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

window.loadAccountList = async function () {
  try {
    const sessionRes = await supabase.auth.getSession();
    const token = sessionRes.data.session?.access_token;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("データ取得失敗");

    allAccounts = data;
    renderAccounts("all");
  } catch (e) {
    console.error("データ取得エラー:", e);
    document.getElementById("accountTableBody").innerHTML = `<tr><td colspan="5">読み込みに失敗しました</td></tr>`;
  }
};

function renderAccounts(filter) {
  const tbody = document.getElementById("accountTableBody");
  tbody.innerHTML = "";
  const filtered = allAccounts.filter(acc =>
    filter === "approved" ? acc.status === "approved" :
    filter === "pending" ? acc.status === "pending" :
    true
  );
  filtered.forEach(acc => {
    const statusClass = acc.status === "approved" ? "status-approved" : "status-pending";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-id="${acc.id}"></td>
      <td>${acc.org_name}</td>
      <td>${acc.email}</td>
      <td class="${statusClass}">${acc.status}</td>
      <td>${acc.is_admin ? "✅" : ""}</td>`;
    tbody.appendChild(tr);
  });
}

window.applyFilter = (type) => renderAccounts(type);

window.toggleAll = (checkbox) => {
  document.querySelectorAll("#accountTableBody input[type='checkbox']")
    .forEach(cb => cb.checked = checkbox.checked);
};

window.approveSelected = () => updateStatus("approved");
window.rejectSelected = () => updateStatus("pending");
window.deleteSelected = async () => {
  const ids = getSelectedIds();
  if (ids.length === 0) return;

  const { data, error } = await supabase
    .from("applications")
    .delete()
    .in("id", ids);

  if (error) {
    alert("削除に失敗しました");
  } else {
    loadAccountList();
  }
};

async function updateStatus(newStatus) {
  const ids = getSelectedIds();
  if (ids.length === 0) return;

  const { data, error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .in("id", ids);

  if (error) {
    alert("更新に失敗しました");
  } else {
    loadAccountList();
  }
}

function getSelectedIds() {
  return Array.from(document.querySelectorAll("#accountTableBody input[type='checkbox']"))
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.getAttribute("data-id")));
}
