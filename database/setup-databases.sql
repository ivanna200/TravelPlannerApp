-- TravelPlanner: one SQL login, four service databases (database-per-microservice)
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'travelplanner')
    CREATE LOGIN travelplanner WITH PASSWORD = 'TravelPlanner123!';
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'UserServiceDB')
    CREATE DATABASE UserServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TravelPlanServiceDB')
    CREATE DATABASE TravelPlanServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ExpenseServiceDB')
    CREATE DATABASE ExpenseServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ChecklistServiceDB')
    CREATE DATABASE ChecklistServiceDB;
GO

USE UserServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'travelplanner')
BEGIN
    CREATE USER travelplanner FOR LOGIN travelplanner;
    ALTER ROLE db_owner ADD MEMBER travelplanner;
END
GO

USE TravelPlanServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'travelplanner')
BEGIN
    CREATE USER travelplanner FOR LOGIN travelplanner;
    ALTER ROLE db_owner ADD MEMBER travelplanner;
END
GO

USE ExpenseServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'travelplanner')
BEGIN
    CREATE USER travelplanner FOR LOGIN travelplanner;
    ALTER ROLE db_owner ADD MEMBER travelplanner;
END
GO

USE ChecklistServiceDB;
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'travelplanner')
BEGIN
    CREATE USER travelplanner FOR LOGIN travelplanner;
    ALTER ROLE db_owner ADD MEMBER travelplanner;
END
GO
