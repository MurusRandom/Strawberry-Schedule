
CREATE TABLE nauczyciele (
    id INT PRIMARY KEY AUTO_INCREMENT,
    imie VARCHAR(50) NOT NULL,
    drugie_imie VARCHAR(50),
    nazwisko VARCHAR(50) NOT NULL,
    skrot VARCHAR(10)
) ENGINE=InnoDB;

CREATE TABLE klasy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(50) NOT NULL,
    skrot VARCHAR(10)
) ENGINE=InnoDB;

CREATE TABLE sale (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE przedmioty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(50) NOT NULL,
    skrot VARCHAR(10)
) ENGINE=InnoDB;

CREATE TABLE sfery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dzien TINYINT NOT NULL CHECK (dzien BETWEEN 0 AND 4),
    godzina TINYINT NOT NULL CHECK (godzina BETWEEN 1 AND 12),
    nauczyciel_id INT NOT NULL,
    klasa_id INT NOT NULL,
    przedmiot_id INT NOT NULL,
    sala_id INT NOT NULL,
    grupa VARCHAR(20),
    czyZastepstwo BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (nauczyciel_id) REFERENCES nauczyciele(id) ON DELETE CASCADE,
    FOREIGN KEY (klasa_id) REFERENCES klasy(id) ON DELETE CASCADE,
    FOREIGN KEY (przedmiot_id) REFERENCES przedmioty(id) ON DELETE CASCADE,
    FOREIGN KEY (sala_id) REFERENCES sale(id) ON DELETE CASCADE
) ENGINE=InnoDB;