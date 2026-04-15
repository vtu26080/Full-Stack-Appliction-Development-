CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY,
    user_name VARCHAR(50),
    amount DECIMAL(10,2),
    transaction_date DATE
);

CREATE TABLE Transaction_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(20),
    transaction_id INT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELIMITER //

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
INSERT INTO Transaction_Log(action_type, transaction_id)
VALUES ('INSERT', NEW.transaction_id);
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_transaction_update
AFTER UPDATE ON Transactions
FOR EACH ROW
BEGIN
INSERT INTO Transaction_Log(action_type, transaction_id)
VALUES ('UPDATE', NEW.transaction_id);
END //

DELIMITER ;

INSERT INTO Transactions VALUES (1,'Arun',2000,'2025-03-07');

UPDATE Transactions
SET amount = 2500
WHERE transaction_id = 1;

SELECT * FROM Transaction_Log;

CREATE VIEW Daily_Activity_Report AS
SELECT 
transaction_date,
COUNT(transaction_id) AS total_transactions,
SUM(amount) AS total_amount
FROM Transactions
GROUP BY transaction_date;

SELECT * FROM Daily_Activity_Report;