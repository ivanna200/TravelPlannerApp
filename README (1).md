# TravelPlanner

Web aplikacija za planiranje putovanja razvijena na **Microsoft Service Fabric** mikroservisnoj platformi sa **React** frontendom.

---

## Sadržaj

1. [Pregled sistema](#1-pregled-sistema)
2. [Arhitektura](#2-arhitektura)
3. [Tehnologije](#3-tehnologije)
4. [Preduslovi](#4-preduslovi)
5. [Postavljanje baze podataka](#5-postavljanje-baze-podataka)
6. [Pokretanje backenda](#6-pokretanje-backenda)
7. [Pokretanje frontenda](#7-pokretanje-frontenda)
8. [Korisničke uloge i pristup](#8-korisničke-uloge-i-pristup)
9. [API referenca](#9-api-referenca)
10. [Struktura baze podataka](#10-struktura-baze-podataka)
11. [Struktura projekta](#11-struktura-projekta)
12. [Funkcionalnosti](#12-funkcionalnosti)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Pregled sistema

TravelPlanner omogućava korisnicima da na jednom mjestu organizuju sve informacije o putovanju: osnovne podatke o putovanju, destinacije, dnevni plan aktivnosti, troškove i budžet, packing listu, te dijeljenje plana s drugim osobama putem QR koda. Kao posebna nadogradnja implementiran je prikaz rute kretanja na interaktivnoj mapi.

---

## 2. Arhitektura

Sistem je organizovan kao mikroservisna aplikacija na Microsoft Service Fabric platformi. Svaki servis ima jasno definisanu odgovornost i komunicira s ostalim servisima isključivo kroz Service Fabric Remoting interfejse.

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│              (Vite, Tailwind CSS, Axios)                 │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP / REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  ApiGateway  [Stateless]                 │
│         ASP.NET Core Web API · JWT · CORS               │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │ SF Remoting          │          │
       ▼          ▼           ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐
│   User   │ │ Travel   │ │ Expense  │ │    Checklist     │
│ Service  │ │  Plan    │ │ Service  │ │    Service       │
│Stateless │ │ Service  │ │Stateful  │ │   Stateless      │
│          │ │Stateful  │ │          │ │                  │
│ Auth     │ │ Planovi  │ │ Troškovi │ │  Packing lista   │
│ JWT gen. │ │ Dest.    │ │ Budžet   │ │                  │
│ BCrypt   │ │ Aktiv.   │ │          │ │                  │
│          │ │ Dijeljenje│ │          │ │                  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘
     │             │             │                │
     ▼             ▼             ▼                ▼
┌──────────────────────────────────────────────────────────┐
│                    SQL Server                            │
│  TravelPlannerDB  (jedna baza, zasebne tablice)          │
└──────────────────────────────────────────────────────────┘
```

### Opis servisa

| Servis | Tip | Odgovornost |
|--------|-----|-------------|
| **ApiGateway** | Stateless | Jedina ulazna tačka za frontend. Autentikacija (JWT), CORS, rutiranje zahtjeva ka internim servisima putem SF Remoting-a. |
| **UserService** | Stateless | Registracija i prijava korisnika, generisanje JWT tokena, BCrypt hashiranje lozinki, upravljanje ulogama. |
| **TravelPlanService** | Stateful (3 replike) | Upravljanje planovima putovanja, destinacijama, aktivnostima i share tokenima. Kaskadno brisanje u okviru EF Core. |
| **ExpenseService** | Stateful (3 replike) | Evidencija troškova, kategorizacija, izračun budget summary. |
| **ChecklistService** | Stateless | Upravljanje packing listom (CRUD, toggle završenosti stavke). |

---

## 3. Tehnologije

### Backend
- .NET 8
- Microsoft Service Fabric 10.x
- ASP.NET Core Web API
- Entity Framework Core + SQL Server
- BCrypt.Net (hashiranje lozinki)
- JWT Bearer Authentication
- QRCoder (generisanje QR kodova)
- SF Remoting (inter-service komunikacija)

### Frontend
- React 19
- Vite
- Tailwind CSS 3
- Axios (HTTP klijent sa interceptorima)
- React Router DOM 7
- Leaflet 1.9 + OpenStreetMap (interaktivna mapa rute)
- Context API + useReducer (upravljanje stanjem)

---

## 4. Preduslovi

Prije pokretanja sistema potrebno je imati instalirano:

| Alat | Minimalna verzija | Napomena |
|------|-------------------|---------|
| Windows OS | Windows 10/11 | Service Fabric radi samo na Windowsu |
| .NET SDK | 8.0 | `dotnet --version` za provjeru |
| Visual Studio | 2022 (17.x) | Sa ASP.NET i Azure workloadom |
| Service Fabric SDK | 10.x | Instalira se uz Visual Studio ili zasebno |
| SQL Server | 2019+ | Express verzija je dovoljna |
| SQL Server Management Studio | Bilo koja verzija | Za upravljanje bazom |
| Node.js | 20+ | `node --version` za provjeru |
| npm | 10+ | Dolazi uz Node.js |

---

## 5. Postavljanje baze podataka

### Kreiranje SQL Server logina i baze

Otvorite **SQL Server Management Studio**, povežite se na lokalnu instancu i pokrenite sljedeći script:

```sql
-- Kreiranje baze podataka
CREATE DATABASE TravelPlannerDB;
GO

-- Kreiranje SQL Server logina
CREATE LOGIN travelplanner WITH PASSWORD = 'TravelPlanner123!';
GO

-- Kreiranje korisnika unutar baze
USE TravelPlannerDB;
GO
CREATE USER travelplanner FOR LOGIN travelplanner;
GO

-- Dodjela vlasničkih prava (potrebno za kreiranje tabela putem migracija)
ALTER ROLE db_owner ADD MEMBER travelplanner;
GO
```

### Automatske migracije

SQL migracije se **primjenjuju automatski** pri svakom pokretanju servisa. U svakom `Program.cs` postoji:

```csharp
db.Database.Migrate();
```

Nije potrebno ručno pokretati `dotnet ef database update`.

### Connection string

Svi servisi koriste isti connection string koji se nalazi u njihovim `appsettings.json` fajlovima:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TravelPlannerDB;User Id=travelplanner;Password=TravelPlanner123!;TrustServerCertificate=True;"
}
```

---

## 6. Pokretanje backenda

### Korak 1 — Pokretanje lokalnog Service Fabric klastera

1. U System Trayu pronađite ikonu **Service Fabric Local Cluster Manager**
2. Desni klik → **Start Local Cluster**
3. Odaberite **5 Node** za realnije testiranje (ili 1 Node za brže pokretanje)
4. Sačekajte da ikona postane zelena (može potrajati 1–2 minute)

### Korak 2 — Deploy aplikacije iz Visual Studija

1. Otvorite `TravelPlannerApp.sln` u Visual Studio 2022
2. Desni klik na projekat `TravelPlannerApp` u Solution Exploreru
3. Odaberite **Publish...**
4. Target: **Local Cluster** → kliknite **Publish**

**Alternativno (F5 debug mode):**

Postavite `TravelPlannerApp` kao startup projekat i pritisnite **F5**. Aplikacija se deploya i pokreće u debug modu.

### Korak 3 — Provjera da su servisi pokrenuti

Otvorite Service Fabric Explorer u browseru:

```
http://localhost:19080
```

U dijelu **Applications → TravelPlannerAppType** svi servisi moraju imati status **OK** (zelena oznaka):

- `fabric:/TravelPlannerApp/ApiGateway`
- `fabric:/TravelPlannerApp/UserService`
- `fabric:/TravelPlannerApp/TravelPlanService`
- `fabric:/TravelPlannerApp/ExpenseService`
- `fabric:/TravelPlannerApp/ChecklistService`

---

## 7. Pokretanje frontenda

### Korak 1 — Instalacija zavisnosti

```bash
cd frontend
npm install
```

Ovo instalira sve zavisnosti uključujući `leaflet` za interaktivnu mapu rute.

### Korak 2 — Konfiguracija okruženja

Kreirajte fajl `.env` u `frontend/` direktorijumu:

```env
VITE_API_URL=http://localhost:8387
```

Port `8387` je konfigurisan u Service Fabric manifestu kao `ServiceEndpoint` za ApiGateway. Sve HTTP pozive ka backendu frontend čita isključivo iz ove varijable.

### Korak 3 — Pokretanje razvojnog servera

```bash
npm run dev
```

Aplikacija je dostupna na: **http://localhost:5173**

### Build za produkciju

```bash
npm run build
```

Produkcijski build se kreira u direktorijumu `frontend/dist/`.

---

## 8. Korisničke uloge i pristup

Sistem podržava dvije korisničke uloge:

| Uloga | Opis |
|-------|------|
| **User** | Standardni korisnik. Može kreirati, pregledati, mijenjati i brisati vlastite planove putovanja i sve podatke vezane za njih (destinacije, aktivnosti, troškove, checklist). Može generisati share linkove. |
| **Admin** | Sve što User + pristup Admin panelu. Može pregledati listu svih korisnika, brisati korisničke naloge (kaskadno briše sve njihove podatke) i mijenjati uloge korisnika. |

### Kreiranje prvog Admin korisnika

Nakon što se registrujete putem aplikacije, promijenite ulogu direktno u bazi:

```sql
USE TravelPlannerDB;
UPDATE Users SET Role = 'Admin' WHERE Email = 'vas@email.com';
```

Ili, ako već imate Admin nalog, koristite Admin panel unutar aplikacije (Settings → Admin panel).

### JWT token

- Token se generišse pri prijavi i registraciji
- Traje **8 sati**
- Sadrži: `Id`, `Email`, `Role`, `FirstName`, `LastName`
- Validiraju se: potpis, izdavalac (issuer), publika (audience) i istek

---

## 9. API referenca

Svi zahtjevi idu na `http://localhost:8387`. Zaštićeni endpointi zahtjevaju `Authorization: Bearer <token>` header.

### Autentikacija i korisnici

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| POST | `/api/auth/register` | — | Registracija novog korisnika |
| POST | `/api/auth/login` | — | Prijava, vraća JWT token |
| GET | `/api/users/{id}` | ✓ | Dohvata podatke korisnika |
| GET | `/api/users` | Admin | Lista svih korisnika |
| DELETE | `/api/users/{id}` | Admin | Briše korisnika i sve njegove podatke |
| PATCH | `/api/users/{id}/role` | Admin | Mijenja ulogu korisnika |

### Planovi putovanja

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/travel-plans/{id}` | ✓ | Dohvata plan s destinacijama i aktivnostima |
| GET | `/api/travel-plans/user/{userId}` | ✓ | Lista planova korisnika |
| POST | `/api/travel-plans` | ✓ | Kreiranje novog plana |
| PUT | `/api/travel-plans/{id}` | ✓ | Izmjena plana |
| DELETE | `/api/travel-plans/{id}` | ✓ | Brisanje plana i svih povezanih podataka |

### Destinacije

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/destinations/{id}` | ✓ | Dohvata destinaciju |
| GET | `/api/destinations/plan/{travelPlanId}` | ✓ | Lista destinacija plana |
| POST | `/api/destinations` | ✓ | Dodavanje destinacije |
| PUT | `/api/destinations/{id}` | ✓ | Izmjena destinacije |
| DELETE | `/api/destinations/{id}` | ✓ | Brisanje destinacije |

### Aktivnosti

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/activities/{id}` | ✓ | Dohvata aktivnost |
| GET | `/api/activities/plan/{travelPlanId}` | ✓ | Lista aktivnosti plana |
| GET | `/api/activities/plan/{travelPlanId}/date/{date}` | ✓ | Aktivnosti za određeni dan |
| POST | `/api/activities` | ✓ | Dodavanje aktivnosti |
| PUT | `/api/activities/{id}` | ✓ | Izmjena aktivnosti |
| DELETE | `/api/activities/{id}` | ✓ | Brisanje aktivnosti |

### Troškovi

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/expenses/{id}` | ✓ | Dohvata trošak |
| GET | `/api/expenses/plan/{travelPlanId}` | ✓ | Lista troškova plana |
| GET | `/api/expenses/plan/{travelPlanId}/category/{category}` | ✓ | Troškovi po kategoriji |
| GET | `/api/expenses/plan/{travelPlanId}/budget-summary` | ✓ | Pregled budžeta i ukupnih troškova |
| POST | `/api/expenses` | ✓ | Dodavanje troška |
| PUT | `/api/expenses/{id}` | ✓ | Izmjena troška |
| DELETE | `/api/expenses/{id}` | ✓ | Brisanje troška |

**Dozvoljene kategorije troškova:** `Prevoz`, `Smještaj`, `Hrana`, `Ulaznice`, `Kupovina`, `Ostalo`

### Checklist (Packing lista)

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/checklist/{id}` | ✓ | Dohvata stavku |
| GET | `/api/checklist/plan/{travelPlanId}` | ✓ | Lista stavki plana |
| POST | `/api/checklist` | ✓ | Dodavanje stavke |
| PUT | `/api/checklist/{id}` | ✓ | Izmjena stavke |
| PATCH | `/api/checklist/{id}/toggle` | ✓ | Označavanje stavke kao završene/nezavršene |
| DELETE | `/api/checklist/{id}` | ✓ | Brisanje stavke |

### Dijeljenje plana

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| POST | `/api/sharing` | ✓ | Generisanje share tokena (VIEW ili EDIT, 7 dana) |
| GET | `/api/sharing/plan/{travelPlanId}` | ✓ | Lista aktivnih share tokena za plan |
| DELETE | `/api/sharing/{id}` | ✓ | Opozivanje share tokena |
| GET | `/api/sharing/{token}/validate` | — | Validacija tokena |
| GET | `/api/sharing/{token}/plan` | — | Dohvata plan putem share tokena |
| GET | `/api/sharing/{token}/qr-code` | — | Vraća PNG sliku QR koda |
| PUT | `/api/sharing/{token}/plan` | — | Ažuriranje plana putem EDIT tokena |

---

## 10. Struktura baze podataka

Sve tablice nalaze se u jednoj bazi `TravelPlannerDB`. Svaki mikroservis pristupa samo tablicama za koje je zadužen.

### Users *(UserService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| FirstName | nvarchar(100) | Ime |
| LastName | nvarchar(100) | Prezime |
| Email | nvarchar(255) UNIQUE | Email adresa |
| PasswordHash | nvarchar(max) | BCrypt hash lozinke |
| Role | nvarchar(50) | `User` ili `Admin` |
| CreatedAt | datetime2 | Datum registracije |

### TravelPlans *(TravelPlanService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Name | nvarchar(200) | Naziv plana |
| Description | nvarchar(max) | Opis putovanja |
| StartDate | datetime2 | Datum početka |
| EndDate | datetime2 | Datum završetka |
| Budget | decimal(18,2) | Planirani budžet |
| Notes | nvarchar(max) | Napomene |
| UserId | int | ID vlasnika plana |
| CreatedAt | datetime2 | Datum kreiranja |

### Destinations *(TravelPlanService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Name | nvarchar(200) | Naziv destinacije |
| Location | nvarchar(300) | Lokacija |
| ArrivalDate | datetime2 | Datum dolaska |
| DepartureDate | datetime2 | Datum odlaska |
| Description | nvarchar(max) | Opis i napomene |
| TravelPlanId | int FK | → TravelPlans(Id) CASCADE DELETE |

### Activities *(TravelPlanService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Name | nvarchar(200) | Naziv aktivnosti |
| Date | datetime2 | Datum aktivnosti |
| Time | nvarchar(50) | Vrijeme (HH:mm) |
| Location | nvarchar(max) | Lokacija |
| Description | nvarchar(max) | Opis |
| EstimatedCost | decimal(18,2) | Procijenjeni trošak |
| Status | nvarchar(50) | `Planirano` / `Rezervisano` / `Završeno` / `Otkazano` |
| TravelPlanId | int FK | → TravelPlans(Id) CASCADE DELETE |

### ShareTokens *(TravelPlanService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Token | nvarchar(500) UNIQUE | UUID token za dijeljenje |
| AccessType | nvarchar(10) | `VIEW` ili `EDIT` |
| TravelPlanId | int FK | → TravelPlans(Id) CASCADE DELETE |
| ExpiresAt | datetime2 | Datum isteka (7 dana od kreiranja) |
| CreatedAt | datetime2 | Datum kreiranja |

### Expenses *(ExpenseService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Name | nvarchar(200) | Naziv troška |
| Category | nvarchar(100) | Kategorija troška |
| Amount | decimal(18,2) | Iznos u eurima |
| Date | datetime2 | Datum troška |
| Description | nvarchar(max) | Opis |
| TravelPlanId | int | Logički FK ka planu (zasebna baza) |
| CreatedAt | datetime2 | Datum unosa |

### ChecklistItems *(ChecklistService)*

| Kolona | Tip | Opis |
|--------|-----|------|
| Id | int PK | Primarni ključ |
| Name | nvarchar(300) | Naziv stavke |
| IsCompleted | bit | Da li je stavka završena |
| TravelPlanId | int | Logički FK ka planu (zasebna baza) |
| CreatedAt | datetime2 | Datum dodavanja |

> **Napomena o kaskadnom brisanju:** Destinations, Activities i ShareTokens imaju EF Core `CASCADE DELETE` ka TravelPlans unutar iste baze. Expenses i ChecklistItems su u tablicama kojima pristupaju zasebni mikroservisi — pri brisanju plana ili korisnika, ApiGateway eksplicitno poziva `DeletePlanExpensesAsync` i `DeletePlanItemsAsync` na odgovarajućim servisima.

---

## 11. Struktura projekta

```
TravelPlannerApp/
│
├── TravelPlannerApp/              # SF Application projekat (manifesti)
│   ├── ApplicationManifest.xml
│   └── StartupServices.xml
│
├── ApiGateway/                    # Ulazna tačka, JWT, CORS
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── TravelPlansController.cs
│   │   ├── DestinationsController.cs
│   │   ├── ActivitiesController.cs
│   │   ├── ExpensesController.cs
│   │   ├── ChecklistController.cs
│   │   └── SharingController.cs
│   ├── ApiGateway.cs              # SF Stateless service + Kestrel setup
│   └── appsettings.json
│
├── UserService/                   # Auth, JWT generisanje
│   ├── Services/AuthService.cs
│   ├── Data/AppDbContext.cs
│   ├── Models/User.cs
│   └── UserService.cs             # SF Stateless service
│
├── TravelPlanService/             # Planovi, destinacije, aktivnosti, dijeljenje
│   ├── Services/TravelPlanningService.cs
│   ├── Data/TravelPlanDbContext.cs
│   ├── Models/                    # TravelPlan, Destination, Activity, ShareToken
│   └── TravelPlanService.cs       # SF Stateful service
│
├── ExpenseService/                # Troškovi i budžet
│   ├── Services/ExpenseManagementService.cs
│   ├── Data/ExpenseDbContext.cs
│   ├── Models/Expense.cs
│   └── ExpenseService.cs          # SF Stateful service
│
├── ChecklistService/              # Packing lista
│   ├── Services/ChecklistManagementService.cs
│   ├── Data/ChecklistDbContext.cs
│   ├── Models/ChecklistItem.cs
│   └── ChecklistService.cs        # SF Stateless service
│
├── TravelPlanner.Shared/          # Dijeljeni interfejsi i DTOs
│   ├── Interfaces/
│   │   ├── ITravelPlanService.cs
│   │   ├── IUserService.cs
│   │   ├── IExpenseService.cs
│   │   └── IChecklistService.cs
│   └── DTOs/                      # Svi DTO modeli
│
└── frontend/                      # React aplikacija
    ├── src/
    │   ├── pages/                 # LoginPage, Dashboard, TravelPlanDetail...
    │   ├── components/            # Navbar, Modal, Toast, CalendarView, RouteMapView...
    │   │   └── plan/              # OverviewTab, ActivitiesTab, ExpensesTab...
    │   ├── context/               # AuthContext, TravelPlanContext, ToastContext
    │   ├── hooks/                 # useAuth, useTravelPlan, useToast
    │   │   └── plan/              # usePlanActivities, usePlanExpenses...
    │   ├── services/              # authService, travelPlanService, axiosConfig...
    │   ├── models/                # Activity.js, TravelPlan.js, Expense.js...
    │   └── utils/                 # formatDate.js, pdfExport.js
    ├── .env                       # VITE_API_URL=http://localhost:8387
    └── package.json
```

---

## 12. Funkcionalnosti

### Upravljanje planovima putovanja
Korisnik može kreirati plan s nazivom, opisom, datumima, budžetom i napomenama. Sistem validira da krajnji datum nije prije početnog i da budžet nije negativan. Svi planovi prikazuju se na dashboardu s informacijom o statusu (u toku, predstojeće, završeno).

### Destinacije
Za svaki plan mogu se dodati jedna ili više destinacija s datumima dolaska i odlaska, lokacijom i opisom. Datumi destinacije moraju biti unutar perioda putovanja.

### Aktivnosti
Aktivnosti se planiraju po danima i mogu se pregledati na tri načina: lista grupirana po datumu, kalendarski prikaz s navigacijom po danima i interaktivna mapa rute. Svaka aktivnost ima naziv, datum, vrijeme, lokaciju, opis, procijenjeni trošak i status.

### Troškovi i budžet
Korisnik evidentira troškove razvrstane u kategorije (Prevoz, Smještaj, Hrana, Ulaznice, Kupovina, Ostalo). Sistem automatski izračunava ukupne troškove, preostali budžet i prikazuje grafički pregled potrošnje po kategorijama.

### Packing lista (Checklist)
Korisnik kreira listu stvari koje treba ponijeti ili obaveza koje treba završiti. Stavke se mogu označavati kao završene, a progress bar pokazuje koliko je stavki završeno.

### Dijeljenje plana putem QR koda
Korisnik može generisati link za dijeljenje plana s dvije razine pristupa: VIEW (samo pregled) i EDIT (pregled i uređivanje). Link ističe za 7 dana. Aplikacija prikazuje QR kod koji se može skenirati za brzi pristup. Mogu se pregledati svi aktivni linkovi i pozvokati ih.

### PDF export
Iz pregleda plana korisnik može preuzeti PDF izvještaj s kompletnim podacima o putovanju: destinacije, raspored aktivnosti, evidencija troškova i packing lista.

### Admin panel
Administratori imaju pristup panelu za upravljanje korisnicima: pregled liste, brisanje naloga (kaskadno briše sve podatke) i promjena korisničkih uloga.

### Interaktivna mapa rute *(Nadogradnja)*
U tabovi Aktivnosti dostupan je prikaz Mapa koji prikazuje rutu kretanja na interaktivnoj OpenStreetMap karti. Svaka aktivnost s unesenom lokacijom prikazuje se numeriranim markerom u boji koja odgovara statusu aktivnosti. Između markera crta se isprekidana linija rute sa strelicama smjera kretanja. Lokacije se geocodiraju putem Nominatim servisa (besplatno, bez API ključa).

---

## 13. Troubleshooting

**Servis ne startuje — greška u SF Exploreru**

Provjeri da SQL Server radi i da je connection string u `appsettings.json` ispravan. Provjeri da korisnik `travelplanner` ima pristup bazi.

**CORS greška u browseru**

Provjeri da frontend port (defaultno 5173) postoji u CORS politici u `ApiGateway.cs`. Ako koristiš drugi port, dodaj ga u `WithOrigins(...)`.

**401 Unauthorized na svim zahtjevima**

JWT token je istekao (traje 8 sati). Odjavi se i prijavi ponovo. Provjeri da `JwtSettings` u `ApiGateway/appsettings.json` i `UserService/appsettings.json` imaju identičan `Secret`.

**Mapa ne prikazuje markere**

Unesite puni naziv lokacije s državom, npr. `Eiffelov toranj, Pariz, Francuska` umjesto samo `toranj`. Nominatim geocoding zahtjeva prepoznatljiv naziv lokacije. Geocodiranje traje oko 1 sekunde po lokaciji zbog rate limitinga.

**QR kod vodi na pogrešnu adresu**

Provjeri `AppSettings:FrontendUrl` u `ApiGateway/appsettings.json` i `TravelPlanService/appsettings.json`. Vrijednost mora odgovarati adresi na kojoj radi frontend.

**PDF se ne otvara**

Browser blokira popup prozore. Dozvoli popup-ove za `localhost` u postavkama browsera.
