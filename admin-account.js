export default async function init(supabase, config) {
  const token = config.token;
  if (!token) {
    document.getElementById("approvalTable").innerHTML = "<tr><td colspan='5'>ログインしてください</td></tr>";
    return;
  }

  const filterInputs = document.querySelectorAll("input[name='filter']");
  filterInputs.forEach(input => input.addEventListener("change", loadData));
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.action));
  });

  await loadData();

  async function loadData() {
    let url = `${config.supabaseUrl}/rest/v1/applications?select=id,email,org_name,status`;
    const filter = document.querySelector("input[name='filter']:checked").value;
    if (filter === "pending") url += "&status=eq.pending";
    if (filter === "approved") url += "&status=eq.approved";

    const res = await fetch(url, {
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    const tbody = document.getElementById("approvalTable");
    tbody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" value="${row.id}" /></td>
        <td>${row.id}</td>
        <td>${row.org_name}</td>
        <td>${row.email}</td>
        <td class="${row.status === 'approved' ? 'status-approved' : 'status-pending'}">${row.status}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function updateStatus(newStatus) {
    const checked = document.querySelectorAll("#approvalTable input[type='checkbox']:checked");
    if (!checked.length) return alert("対象が選択されていません");

    const promises = Array.from(checked).map(cb =>
      fetch(`${config.supabaseUrl}/rest/v1/applications?id=eq.${cb.value}`, {
        method: "PATCH",
        headers: {
          apikey: config.supabaseKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })
    );

    await Promise.all(promises);
    alert("ステータスを更新しました");
    await loadData();
  }
}
