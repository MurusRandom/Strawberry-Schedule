<?php


if ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo 'Niepoprawne dane JSON';
        exit;
    }
    $dsn = 'mysql:host=localhost;dbname=strawberry;charset=utf8';
    $username = 'root';
    $password = '';
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC];
    try {
        $pdo = new PDO($dsn, $username, $password, $options);
        $pdo->beginTransaction();

        function upsert($pdo, $table, $row) {
            $cols = array_keys($row);
            $place = array_map(fn($c) => ":$c", $cols);
            $updates = array_map(fn($c) => "$c = VALUES($c)" , $cols);
            $sql = "INSERT INTO $table (" . implode(',', $cols) . ") VALUES (" . implode(',', $place) . ") ON DUPLICATE KEY UPDATE " . implode(',', $updates);
            $stmt = $pdo->prepare($sql);
            foreach ($row as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();
        }

        foreach ($data['nauczyciele'] as $n) {
            upsert($pdo, 'nauczyciele', [
                'id' => $n['id'],
                'imie' => $n['imie'],
                'drugie_imie' => $n['drugie_imie'] ?? null,
                'nazwisko' => $n['nazwisko'],
                'skrot' => $n['skrot'] ?? null
            ]);
        }

        foreach ($data['klasy'] as $k) {
            upsert($pdo, 'klasy', [
                'id' => $k['id'],
                'nazwa' => $k['nazwa'],
                'skrot' => $k['skrot'] ?? null
            ]);
        }
        foreach ($data['sale'] as $s) {
            upsert($pdo, 'sale', [
                'id' => $s['id'],
                'nazwa' => $s['nazwa']
            ]);
        }
        foreach ($data['przedmioty'] as $p) {
            upsert($pdo, 'przedmioty', [
                'id' => $p['id'],
                'nazwa' => $p['nazwa'],
                'skrot' => $p['skrot'] ?? null
            ]);
        }
        foreach ($data['sfery'] as $sf) {
            upsert($pdo, 'sfery', [
                'id' => $sf['id'],
                'dzien' => $sf['dzien'],
                'godzina' => $sf['godzina'],
                'nauczyciel_id' => $sf['nauczyciel']['id'],
                'klasa_id' => $sf['klasa']['id'],
                'przedmiot_id' => $sf['przedmiot']['id'],
                'sala_id' => $sf['sala']['id'],
                'grupa' => $sf['grupa'] ?? null,
                'czyZastepstwo' => $sf['czyZastepstwo'] ? 1 : 0
            ]);
        }
        $pdo->commit();
        echo 'Dane zapisane pomyślnie';
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo 'Błąd zapisu: ' . $e->getMessage();
    }
    exit;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['load']) && $_GET['load'] == '1') {
    header('Content-Type: application/json');
    $pdo = new PDO('mysql:host=localhost;dbname=strawberry;charset=utf8','root','',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    $nauc = $pdo->query('SELECT * FROM nauczyciele')->fetchAll();
    $kl = $pdo->query('SELECT * FROM klasy')->fetchAll();
    $sa = $pdo->query('SELECT * FROM sale')->fetchAll();
    $prz = $pdo->query('SELECT * FROM przedmioty')->fetchAll();
    $sf = $pdo->query('SELECT * FROM sfery')->fetchAll();
    echo json_encode(['nauczyciele'=>$nauc,'klasy'=>$kl,'sale'=>$sa,'przedmioty'=>$prz,'sfery'=>$sf]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Strawberry</title>
  <link rel="stylesheet" href="styl.css">
</head>
<body>
  <header>Strawberry</header>
  <div id="main">

    <div id="left">
      <button class="menu-button" onclick="toggleDropdown('klasyDropdown')">Klasy</button>
      <button class="menu-button" onclick="toggleDropdown('nauczycieleDropdown')">Nauczyciele</button>
      <button class="menu-button" onclick="toggleDropdown('saleDropdown')">Sale</button>
      <div id="klasyDropdown" class="dropdown"></div>
      <div id="nauczycieleDropdown" class="dropdown"></div>
      <div id="saleDropdown" class="dropdown"></div>
    </div>

    <div id="center">
      <div id="nazwaTabeli"></div>
      <div id="scheduleContainer"></div>
    </div>

    <div id="right">
      <h3>Dodaj nowy element</h3>
      <form id="formDodaj" onsubmit="dodajElement(); return false;">
        <label>Typ:
          <select id="typElementu" onchange="zmienFormularz()">
            <option value="nauczyciel">Nauczyciel</option>
            <option value="klasa">Klasa</option>
            <option value="sala">Sala</option>
            <option value="przedmiot">Przedmiot</option>
            <option value="lekcja">Lekcja</option>
          </select>
        </label>
        <div id="polaFormularza"></div>
        <button type="submit">Dodaj</button>
      </form>

      <div id="formWrapper">
        <h3>Szczegóły lekcji</h3>
        <div id="formContainer">
          <p>Wybierz komórkę, aby edytować lekcję.</p>
        </div>
      </div>

      <button id="loadBtn">Wczytaj dane z bazy danych</button>
      <button id="saveBtn">Zapisz do bazy danych</button>
    </div>

  </div>
  <footer>© Plan Lekcji</footer>

  <script src="main2.js"></script>
  <script
    document.getElementById('loadBtn').addEventListener('click', async () => {
      try {
        const res = await fetch('?load=1');
        const data = await res.json();
        nauczyciele.length = klasy.length = sale.length = przedmioty.length = sfery.length = 0;
        data.nauczyciele.forEach(n => nauczyciele.push(new Nauczyciel(n.id, n.imie, n.nazwisko, n.drugie_imie, n.skrot)));
        data.klasy.forEach(k => klasy.push(new Klasa(k.id, k.nazwa, k.skrot)));
        data.sale.forEach(s => sale.push(new Sala(s.id, s.nazwa)));
        data.przedmioty.forEach(p => przedmioty.push(new Przedmiot(p.id, p.nazwa, p.skrot)));
        data.sfery.forEach(sf => {
          const nauc = nauczyciele.find(n=>n.id===sf.nauczyciel_id);
          const kl   = klasy.find(k=>k.id===sf.klasa_id);
          const prz  = przedmioty.find(p=>p.id===sf.przedmiot_id);
          const sal  = sale.find(s=>s.id===sf.sala_id);
          sfery.push(new Sfera(sf.id, sf.dzien, sf.godzina, nauc, kl, prz, sal, sf.grupa, !!sf.czyZastepstwo));
        });
        renderujNauczycieli(); renderujKlasy(); renderujSale(); zmienFormularz();
        alert('Dane wczytane pomyślnie');
      } catch (e) {
        alert('Błąd wczytywania: ' + e.message);
      }
    });
    document.getElementById('saveBtn').addEventListener('click', async () => {
      const payload = {
        nauczyciele: nauczyciele.map(n => ({ id: n.id, imie: n.imie, drugie_imie: n.drugie_imie, nazwisko: n.nazwisko, skrot: n.skrot })),
        klasy: klasy.map(k => ({ id: k.id, nazwa: k.nazwa, skrot: k.skrot })),
        sale: sale.map(s => ({ id: s.id, nazwa: s.nazwa })),
        przedmioty: przedmioty.map(p => ({ id: p.id, nazwa: p.nazwa, skrot: p.skrot })),
        sfery: sfery.map(sf => ({
          id: sf.id,
          dzien: sf.dzien,
          godzina: sf.godzina,
          nauczyciel: { id: sf.nauczyciel.id },
          klasa:       { id: sf.klasa.id },
          przedmiot:   { id: sf.przedmiot.id },
          sala:        { id: sf.sala.id },
          grupa:       sf.grupa,
          czyZastepstwo: sf.czyZastepstwo
        }))
      };
      try {
        const res = await fetch(location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        alert(text);
      } catch (e) {
        alert('Błąd zapisu: ' + e.message);
      }
    });
  </script>
</body>
</html>
