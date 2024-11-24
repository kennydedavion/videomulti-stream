## Výběr verze

Vyberte verzi pro zobrazení:

<select id="versionSelect" onchange="loadVersion()">
  <option value="v0.0.1">Verze 0.0.1</option>
  <option value="v0.0.2">Verze 0.0.2</option>
  <option value="v0.0.3">Verze 0.0.3</option>
  <!-- Přidej více verzí podle potřeby -->
</select>

<div id="versionContent"></div>

<script>
  function loadVersion() {
    var version = document.getElementById("versionSelect").value;
    var contentDiv = document.getElementById("versionContent");

    // Předpokládáme, že verze jsou součástí veřejného adresáře, kde se budou načítat odpovídající soubory pro každou verzi
    contentDiv.innerHTML = '<iframe src="https://raw.githubusercontent.com/kennydedavion/videomulti-stream/' + version + '/index.html" width="100%" height="600"></iframe>';
  }
</script>
