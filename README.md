# Lennupiletite Broneerimisrakendus

## Projekti Ülevaade
See on lennupiletite broneerimisrakendus, mille esikülg on ehitatud React (Vite) abil ning taustasüsteem töötab aadressil `localhost:8080`. Rakendus võimaldab kasutajatel:
- Vaadata saadaval olevaid lende
- Filtreerida lende sihtkoha, hinna ja kuupäeva järgi
- Valida lennu ja klassi
- Vaadata ning valida saadaval olevaid istekohti
- Broneerida valitud istekohad

## Paigaldamine ja Seadistamine

### Eeltingimused
Veendu, et sul on installitud:
- [Node.js](https://nodejs.org/) (Soovitatav: LTS versioon)
- [Vite](https://vitejs.dev/) (esikülje käitamiseks)
- Taustasüsteem töötab aadressil `localhost:8080`

### Reposiitori kloonimine
```sh
git clone <repository-url>
cd <projekti-kaust>
```

### Sõltuvuste paigaldamine
```sh
npm install
```

### Arendusserveri käivitamine
```sh
npm run dev
```
See käivitab Vite arendusserveri. Rakendus peaks olema kättesaadav aadressil `http://localhost:5173/`.

## Projekti Struktuur
```
.
├── src
│   ├── components
│   │   ├── FlightFilter.jsx
│   │   ├── SeatMap.jsx
│   ├── pages
│   │   ├── Home.jsx
│   ├── App.jsx
│   ├── main.jsx
├── public
├── package.json
├── vite.config.js
└── README.md
```

## Kasutatavad API Päringud
Rakendus suhtleb taustasüsteemiga aadressil `http://localhost:8080`. Peamised API päringud:

| Endpoint                           | Meetod | Kirjeldus                          |
|------------------------------------|--------|------------------------------------|
| `/flights/`                        | GET    | Tagastab kõik saadaval olevad lennud |
| `/flights/filter`                  | GET    | Tagastab filtreeritud lennud       |
| `/seats/{flightId}?class={class}`  | GET    | Tagastab saadaval olevad istekohad |
| `/seats/{flightId}/suggest`        | GET    | Soovitab istekohti vastavalt filtritele |
| `/seats/reserve`                   | PUT    | Broneerib valitud istekohad        |

## Funktsioonid
- **Lendude otsing ja filtreerimine**: Kasutajad saavad otsida ja filtreerida lende erinevate kriteeriumite alusel.
- **Istekoha valik**: Kasutajad saavad valida endale sobiva istekohaga.
- **Istekoha broneerimine**: Valitud istekohad broneeritakse pärast kinnitamist.

## Probleemide Lahendamine
- Veendu, et taustasüsteem töötab aadressil `localhost:8080`.
- Kui `npm run dev` ei tööta, proovi uuesti `npm install`, et kõik sõltuvused oleksid õigesti paigaldatud.

## Tuleviku Täiendused
- Lendude andmed mõne reaalse lennufirma API kaudu
- Lendude ümberistumine
- Testide lisamine
- Rakenduse paigutamine Docker kontainerisse

## Litsents
See projekt on avatud lähtekoodiga ning seda võib vabalt muuta ja täiustada.

