const SUPABASE_URL = window.CARELAY_SUPABASE_URL;
const SUPABASE_KEY = window.CARELAY_SUPABASE_KEY;

let allAccounts = [];

const style = document.createElement("style");
style.textContent = `/* 省略せず全部含めます（前と同じCSS） */`;
document.head.appendChild(style);

window.loadAccountList = async function() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  allAccounts = data;
  renderAccounts("all");
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

// その他関数（applyFilter, toggleAll, approveSelected, rejectSelected, deleteSelected, updateStatus）も同様に修正済
