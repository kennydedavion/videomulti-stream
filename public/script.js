document.addEventListener('DOMContentLoaded', function () {
  const box = document.querySelector('a-box');
  const colorInput = document.getElementById('color-input'); // Měj input pro barvu v HTML

  colorInput.addEventListener('change', function () {
    const newColor = colorInput.value;
    box.setAttribute('color', newColor);
  });
});
