function renderSeriesTabs() {
  const nav = document.getElementById('seriesNav');
  nav.innerHTML = '';

  Object.keys(currentSeriesData).forEach(series => {
    const btn = document.createElement('button');
    btn.className = `series-btn ${series === selectedSeries ? 'active' : ''}`;
    btn.innerText = series;
    btn.onclick = () => {
      selectedSeries = series;
      renderSeriesTabs();
      renderMachines();
    };
    nav.appendChild(btn);
  });
}
function handleSignUp(event) {
  event.preventDefault();

  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 1. Password Confirmation Check
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // 2. Prevent Duplicate Phone Numbers (Check Local Storage / Database)
  let registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  const userExists = registeredUsers.some(user => user.phone === phone);

  if (userExists) {
    alert("This phone number is already registered!");
    return;
  }

  // Save new user if checks pass
  registeredUsers.push({ phone, password });
  localStorage.setItem('users', JSON.stringify(registeredUsers));
  alert("Account created successfully!");
}

