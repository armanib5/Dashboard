/* Private hub — gated by the same Supabase Auth account as map.board's
   /admin/ (see supabase-config.js). Site URLs come from js/site-config.js,
   which you fill in once you know where each site is actually hosted. */

function init() {
  var gate = document.getElementById("sbGate");
  if (!isSupabaseConfigured()) {
    renderSupabaseNotConfigured(gate, "The dashboard");
    return;
  }
  var sb = getSupabase();
  sb.auth.getSession().then(function (res) {
    if (res.data.session) showDash(res.data.session);
    else showLogin();
  });
  sb.auth.onAuthStateChange(function (event, session) {
    if (session) showDash(session); else showLogin();
  });

  document.getElementById("loginBtn").onclick = function () {
    var email = document.getElementById("loginEmail").value.trim();
    var pass = document.getElementById("loginPass").value;
    var err = document.getElementById("loginErr");
    err.style.display = "none";
    sb.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
      if (res.error) { err.textContent = res.error.message; err.style.display = "block"; }
    });
  };
  document.getElementById("signOutBtn").onclick = function (e) {
    e.preventDefault();
    sb.auth.signOut();
  };

  document.querySelectorAll(".tabbtn").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tabbtn").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      renderTab(btn.dataset.tab);
    };
  });
}

function showLogin() {
  document.getElementById("loginWrap").style.display = "block";
  document.getElementById("dashWrap").style.display = "none";
}
function showDash(session) {
  document.getElementById("loginWrap").style.display = "none";
  document.getElementById("dashWrap").style.display = "block";
  document.getElementById("whoami").textContent = session.user.email;
  renderQuickAdd();
  renderSiteCards();
  renderTab("reports");
}

function linkOrNotSet(url, label, cls) {
  if (url) return "<a class='" + cls + "' href='" + url + "' target='_blank' rel='noopener'>" + label + "</a>";
  return "<span class='abtn gray' style='opacity:.5;cursor:default;' title='Set this URL in js/site-config.js'>" + label + " (URL not set)</span>";
}

function renderQuickAdd() {
  var row = document.getElementById("quickAddRow");
  row.innerHTML =
    linkOrNotSet(SITES.baypinned.pinsUrl, "+ Add a Pin (BayPinned)", "abtn gold") +
    linkOrNotSet(SITES.baypinned.boardUrl, "+ Add a Flyer (BayPinned)", "abtn gold") +
    linkOrNotSet(SITES.baypinnedSJ.adminUrl, "+ Add/Edit a Pin (BayPinned SJ)", "abtn gray");
}

function renderSiteCards() {
  var el = document.getElementById("siteCards");
  el.innerHTML =
    "<div class='sitecard'>" +
    "<h3>&#128204; " + SITES.baypinned.label + "</h3>" +
    "<p>Board + map + live Supabase-backed admin: vendors, bookings, pins, pricing, event hours.</p>" +
    "<div class='linkrow'>" +
    linkOrNotSet(SITES.baypinned.adminUrl, "Open Admin", "primary") +
    linkOrNotSet(SITES.baypinned.siteUrl, "View Site", "") +
    "</div></div>" +
    "<div class='sitecard'>" +
    "<h3>&#128204; " + SITES.baypinnedSJ.label + "</h3>" +
    "<p>Pin &amp; zone editor + vendor check-in. Export/paste workflow &mdash; not yet wired to Supabase.</p>" +
    "<div class='linkrow'>" +
    linkOrNotSet(SITES.baypinnedSJ.adminUrl, "Open Admin", "primary") +
    linkOrNotSet(SITES.baypinnedSJ.siteUrl, "View Site", "") +
    "</div></div>";
}

function renderTab(tab) {
  var el = document.getElementById("tabContent");
  el.innerHTML = "<p class='aempty'>Loading&hellip;</p>";
  if (tab === "reports") renderReportsTab(el);
  else if (tab === "business") renderBusinessTab(el);
}

/* Event Reports — reads map.board's `events` table directly (public
   read, per its RLS policy) and summarizes what's there. */
function renderReportsTab(el) {
  var sb = getSupabase();
  sb.from("events").select("id, title, city_id, is_expired, created_at").then(function (res) {
    if (res.error) { el.innerHTML = "<p class='aempty'>" + res.error.message + "</p>"; return; }
    var rows = res.data || [];
    var total = rows.length;
    var active = rows.filter(function (r) { return !r.is_expired; }).length;
    var expired = total - active;
    var byCity = {};
    rows.forEach(function (r) { var c = r.city_id || "?"; byCity[c] = (byCity[c] || 0) + 1; });

    var html = "<div class='statgrid'>" +
      "<div class='stat'><div class='num'>" + total + "</div><div class='lbl'>Total Events</div></div>" +
      "<div class='stat'><div class='num'>" + active + "</div><div class='lbl'>Active</div></div>" +
      "<div class='stat'><div class='num'>" + expired + "</div><div class='lbl'>Expired</div></div>" +
      "<div class='stat'><div class='num'>" + Object.keys(byCity).length + "</div><div class='lbl'>Cities</div></div>" +
      "</div>";

    if (!total) {
      html += "<p class='aempty'>No events yet in Supabase. Note: BayPinned's board still saves flyers to local storage, so it hasn't populated this table yet.</p>";
    } else {
      html += "<div class='sectiontitle' style='margin-top:0;'>By city</div>";
      Object.keys(byCity).sort().forEach(function (c) {
        html += "<div class='eventcard'><span class='etitle'>" + c + "</span><span class='badge approved'>" + byCity[c] + "</span></div>";
      });
      html += "<div class='sectiontitle'>Recent</div>";
      rows.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); })
        .slice(0, 15)
        .forEach(function (r) {
          html += "<div class='eventcard'><span class='etitle'>" + r.title + "</span>" +
            "<span class='badge " + (r.is_expired ? "rejected" : "approved") + "'>" + (r.is_expired ? "expired" : "active") + "</span></div>";
        });
    }
    el.innerHTML = html;
  });
}

/* Business List — reads map.board's `vendors` table. Same table/RLS as
   its own admin Vendors tab, so approve/reject here is a real, live
   change on that site too. */
function renderBusinessTab(el) {
  var sb = getSupabase();
  sb.from("vendors").select("*").order("created_at", { ascending: false }).then(function (res) {
    if (res.error) { el.innerHTML = "<p class='aempty'>" + res.error.message + "</p>"; return; }
    var rows = res.data || [];
    if (!rows.length) { el.innerHTML = "<p class='aempty'>No businesses yet.</p>"; return; }

    var counts = { pending: 0, approved: 0, rejected: 0 };
    rows.forEach(function (v) { counts[v.status] = (counts[v.status] || 0) + 1; });
    var html = "<div class='statgrid'>" +
      "<div class='stat'><div class='num'>" + rows.length + "</div><div class='lbl'>Total</div></div>" +
      "<div class='stat'><div class='num'>" + counts.pending + "</div><div class='lbl'>Pending</div></div>" +
      "<div class='stat'><div class='num'>" + counts.approved + "</div><div class='lbl'>Approved</div></div>" +
      "<div class='stat'><div class='num'>" + counts.rejected + "</div><div class='lbl'>Rejected</div></div>" +
      "</div>";
    el.innerHTML = html;

    rows.forEach(function (v) {
      var row = document.createElement("div"); row.className = "eventcard";
      row.innerHTML = "<span class='etitle'>" + v.name + (v.city_id ? " &middot; " + v.city_id : "") + "</span>" +
        "<span class='badge " + v.status + "'>" + v.status + "</span>";
      if (v.status !== "approved") {
        var approveBtn = document.createElement("button"); approveBtn.className = "abtn green"; approveBtn.textContent = "Approve";
        approveBtn.onclick = function () { sb.from("vendors").update({ status: "approved" }).eq("id", v.id).then(function () { renderBusinessTab(el); }); };
        row.appendChild(approveBtn);
      }
      if (v.status !== "rejected") {
        var rejectBtn = document.createElement("button"); rejectBtn.className = "abtn red"; rejectBtn.textContent = "Reject";
        rejectBtn.onclick = function () { sb.from("vendors").update({ status: "rejected" }).eq("id", v.id).then(function () { renderBusinessTab(el); }); };
        row.appendChild(rejectBtn);
      }
      el.appendChild(row);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
