# TravelPlanner — Use Case dijagram

Opseg prema specifikaciji projektnog zadatka (sekcije 3.1–3.8).

![Use case dijagram](diagrams/use-case-diagram.png)

## Aktori

| Aktor | Opis |
|-------|------|
| **Korisnik** | Registrovani korisnik; kreira i upravlja sopstvenim planovima putovanja |
| **Admin** | Specijalizacija Korisnika — ima **sve** njegove use case-ove **plus** admin panel (spec. 3.7) |
| **Gost** | VIEW dijeljenog plana bez naloga; za EDIT mora biti prijavljen |

### Generalizacija Admin → Korisnik

U UML notaciji, strelica **«generalizacija»** od Admina ka Korisniku znači da Admin **nasljeđuje** sve use case-ove Korisnika. Admin ne mora imati posebne linije ka UC1–UC7 jer ih automatski nasljeđuje.

U implementaciji Admin dodatno može pristupiti **tuđim** planovima (backend preskače provjeru vlasništva kada je uloga Admin).

## Use case-ovi (8 — prema specifikaciji)

| # | Use case | Sekcija spec. | Korisnik | Admin | Gost |
|---|----------|---------------|:--------:|:-----:|:----:|
| 1 | Registracija i login | 3.7 | ✓ | ✓* | |
| 2 | Upravljanje planom putovanja | 3.1, 3.5 | ✓ | ✓* | |
| 3 | Upravljanje destinacijama | 3.2 | ✓ | ✓* | |
| 4 | Upravljanje aktivnostima | 3.3 | ✓ | ✓* | |
| 5 | Troškovi i budžet | 3.4 | ✓ | ✓* | |
| 6 | Checklist | 3.6 | ✓ | ✓* | |
| 7 | Dijeljenje plana | 3.8 | ✓ | ✓* | ✓** |
| 8 | Admin panel | 3.7 | | ✓ | |

\* Admin — nasljeđuje od Korisnika (generalizacija)

\*\* Gost — VIEW bez naloga; EDIT zahtijeva login (JWT) + validan EDIT token

## Veza sa kodom

| Use case | Frontend | Backend |
|----------|----------|---------|
| UC1 | `/login`, `/register` | `AuthController` |
| UC2–UC6 | `/dashboard`, `/plan/:id`, … | Kontroleri + `PlanAccessHelper` |
| UC7 (Korisnik) | dijeljenje u planu | `SharingController` (JWT) |
| UC7 (Gost VIEW) | `/shared/:token` | `SharingController` (token, bez JWT) |
| UC7 (Gost EDIT) | `/shared/:token` → redirect `/login` | `SharingController` (JWT + EDIT token) |
| UC8 | `/admin` (Users + All plans) | `GET /api/travel-plans/admin/all`, `AuthController` |
