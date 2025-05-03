// admin-account.js
export const adminAccount = {
  async init(supabase, config) {
    this.supabase = supabase;
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;

    document.querySelectorAll("input[name='filter']").forEach(input => {
      input.addEventListener("change", () => this.loadData());
    });
    await this.loadData();
  },

  async loadData() {
    const session = (await this.supabase.auth.getSession()).data.session;
    const accessToken = session?.access_token;
    if (!accessToken) {
      document.getElementById("approvalTable").innerHTML = "<tr><td colspan='5'>ログインしてください</td></tr>";
      return;
    }

    const filter = document.querySelector("input[name='filter']:checked").value;
    let url = `${this.supabaseUrl}/rest/v1/applications?select=id,email,org_name,status`;
    if (filter === "pending") url += "&status=eq.pending";
    else if (filter === "approved") url += "&status=eq.approved";

    const res = await fetch(url, {
      headers: {
        apikey: this.supabaseKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    const data = await res.json();

    const tbody = document.getElementById("approvalTable");
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" value="${row.id}"></td>
        <td>${row.id}</td>
        <td>${row.org_name}</td>
        <td>${row.email}</td>
        <td class="${row.status === 'approved' ? 'status-approved' : 'status-pending'}">${row.status}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  async updateStatus(newStatus) {
    const session = (await this.supabase.auth.getSession()).data.session;
    const accessToken = session?.access_token;
    if (!accessToken) return alert("ログインが必要です");

    const checkboxes = document.querySelectorAll('#approvalTable input[type="checkbox"]:checked');
    if (checkboxes.length === 0) return alert("対象が選択されていません");

    const updates = Array.from(checkboxes).map(checkbox =>
      fetch(`${this.supabaseUrl}/rest/v1/applications?id=eq.${checkbox.value}`, {
        method: "PATCH",
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })
    );

    await Promise.all(updates);
    alert(`✅ ステータスを '${newStatus}' に更新しました`);
    await this.loadData();
  }
};
