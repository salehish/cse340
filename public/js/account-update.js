const form = document.querySelector("#accountUpdateForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']");
  updateBtn.removeAttribute("disabled");
});


const form2 = document.querySelector("#changePasswordForm");
form2.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']");
  updateBtn.removeAttribute("disabled");
});