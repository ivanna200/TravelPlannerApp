# TravelPlanner — Use Case Diagram

Specification scope (route-map extension excluded).

## Diagram

```mermaid
flowchart TB
    User((User))
    Admin((Admin))

    subgraph System[Travel Planner]
        UC1(Login / Register)
        UC2(Manage travel plan)
        UC3(Manage destinations)
        UC4(Manage activities)
        UC5(Manage expenses)
        UC6(Packing list)
        UC7(Share plan)
        UC8(Admin panel)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Admin --> UC1
    Admin --> UC8
```

**Shared link (no account):** guest opens link → *View plan* (VIEW) or *Edit destinations/activities* (EDIT).

## Actors

| Actor | Description |
|-------|-------------|
| User | Registered user |
| Admin | Manages users |

## Use cases

| # | Use case | Note |
|---|----------|------|
| 1 | Login / Register | JWT |
| 2 | Manage travel plan | CRUD, dates, budget |
| 3 | Manage destinations | Within trip dates |
| 4 | Manage activities | List and calendar |
| 5 | Manage expenses | Categories, budget summary |
| 6 | Packing list | Toggle items |
| 7 | Share plan | VIEW / EDIT link, QR code |
| 8 | Admin panel | Users: list, delete, role |
