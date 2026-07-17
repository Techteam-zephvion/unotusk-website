(function() {
  try {
    var savedTheme = localStorage.getItem('theme');
    var systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var initialTheme = savedTheme || systemTheme;
    document.documentElement.classList.toggle('light', initialTheme === 'light');
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  } catch (e) {}
})();
