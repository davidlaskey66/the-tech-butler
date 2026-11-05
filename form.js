/* The Tech Butler contact form.
   Sends in the background; if the form service is unreachable, shows phone + a
   pre-filled email so no enquiry is lost. To change services, edit ENDPOINT only. */
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/info@thetechbutler.ca";
  var EMAIL = "info@thetechbutler.ca";
  var PHONE_DISPLAY = "519-671-2016";
  var PHONE_LINK = "tel:+15196712016";

  function value(form, name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function showFallback(form) {
    var box = form.querySelector(".form-status");
    var body =
      "Name: " + value(form, "name") + "\n" +
      "Phone: " + value(form, "phone") + "\n" +
      "Town: " + value(form, "town") + "\n\n" +
      value(form, "message");
    var mailto = "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("Enquiry from thetechbutler.ca") +
      "&body=" + encodeURIComponent(body);
    box.hidden = false;
    box.className = "form-status is-error";
    box.innerHTML =
      "<strong>Sorry, the form couldn’t send just now.</strong> " +
      "Your message is still here. Please <a href=\"" + mailto + "\">send it by email</a> " +
      "(it’s already written for you), or call or text <a href=\"" + PHONE_LINK + "\">" + PHONE_DISPLAY + "</a>.";
    box.focus();
  }

  function init(form) {
    var status = document.createElement("div");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("tabindex", "-1");
    status.hidden = true;
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements["_honey"] && form.elements["_honey"].value) return;
      var btn = form.querySelector("button[type=submit]");
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";
      status.hidden = true;

      var data = new FormData(form);
      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);

      fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error("HTTP " + res.status);
          window.location.href = "/thank-you.html";
        })
        .catch(function () {
          clearTimeout(timer);
          btn.disabled = false;
          btn.textContent = label;
          showFallback(form);
        });
    });
  }

  var forms = document.querySelectorAll("form.contact-form");
  for (var i = 0; i < forms.length; i++) init(forms[i]);
})();
