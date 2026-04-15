CREATE TABLE Accounts (
    account_id INT PRIMARY KEY,
    account_name VARCHAR(50),
    balance DECIMAL(10,2)
);

INSERT INTO Accounts VALUES
(1,'User_Arun',5000),
(2,'Merchant_Amazon',20000);

START TRANSACTION;

UPDATE Accounts
SET balance = balance - 1000
WHERE account_id = 1;

UPDATE Accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;
START TRANSACTION;

UPDATE Accounts
SET balance = balance - 1000
WHERE account_id = 1 AND balance >= 1000;

UPDATE Accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;

SELECT * FROM Accounts;

START TRANSACTION;

UPDATE Accounts
SET balance = balance - 1000
WHERE account_id = 1;

UPDATE Accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;

SELECT * FROM Accounts;