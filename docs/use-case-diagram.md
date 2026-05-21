# TravelPlanner — Use Case Diagram

Actors and use cases aligned with the project specification (excluding the optional route-map extension).

```mermaid
flowchart LR
    subgraph actors [Actors]
        Guest((Guest))
        User((Registered User))
        Admin((Admin))
    end

    subgraph auth [Authentication]
        UC1[Register]
        UC2[Login]
    end

    subgraph plans [Travel Plans]
        UC3[Create travel plan]
        UC4[View dashboard]
        UC5[Edit travel plan]
        UC6[Delete travel plan]
        UC7[Export PDF report]
    end

    subgraph planData [Plan Data]
        UC8[Manage destinations]
        UC9[Manage activities]
        UC10[View calendar]
        UC11[Manage expenses]
        UC12[View budget summary]
        UC13[Manage packing checklist]
    end

    subgraph sharing [Sharing]
        UC14[Create share link VIEW/EDIT]
        UC15[Revoke share link]
        UC16[Display QR code]
        UC17[View shared plan]
        UC18[Edit shared plan via link]
    end

    subgraph admin [Administration]
        UC19[List users]
        UC20[Delete user]
        UC21[Change user role]
    end

    Guest --> UC2
    Guest --> UC17

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15
    User --> UC16

    Admin --> UC2
    Admin --> UC4
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21

    UC14 -.-> UC16
    UC14 -.-> UC17
    UC14 -.-> UC18
```

## Actor summary

| Actor | Description |
|-------|-------------|
| **Guest** | Can open a shared link (VIEW) and sign in |
| **Registered User** | Owns travel plans; full CRUD and sharing |
| **Admin** | User management plus all user capabilities |

## Shared link access

| Access type | Allowed use cases |
|-------------|-------------------|
| **VIEW** | View plan, destinations, activities, checklist (read-only) |
| **EDIT** | VIEW + add/delete destinations and activities |
