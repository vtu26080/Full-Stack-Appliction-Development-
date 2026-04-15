CREATE TABLE Customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50)
);

CREATE TABLE Products1 (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(50),
    price DECIMAL(10,2)
);

CREATE TABLE CustomerOrders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    quantity INT,
    order_date DATE,
    total_amount DECIMAL(10,2),
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES Products1(product_id)
);

INSERT INTO Customers VALUES
(1,'Arun','arun@email.com','Chennai'),
(2,'Priya','priya@email.com','Bangalore'),
(3,'Rahul','rahul@email.com','Mumbai');

INSERT INTO Products1 VALUES
(101,'Laptop',50000),
(102,'Mobile',20000),
(103,'Headphones',2000);

INSERT INTO CustomerOrders VALUES
(1,1,101,1,'2025-03-01',50000),
(2,1,103,2,'2025-03-02',4000),
(3,2,102,1,'2025-03-03',20000),
(4,3,103,5,'2025-03-04',10000),
(5,2,101,1,'2025-03-05',50000);

SELECT 
    c.name AS Customer,
    p.product_name AS Product,
    o.quantity,
    o.total_amount,
    o.order_date
FROM CustomerOrders o
JOIN Customers c ON o.customer_id = c.customer_id
JOIN Products1 p ON o.product_id = p.product_id
ORDER BY o.order_date DESC;
SELECT *
FROM CustomerOrders
WHERE total_amount = (
    SELECT MAX(total_amount)
    FROM CustomerOrders
);
SELECT name
FROM Customers
WHERE customer_id = (
    SELECT customer_id
    FROM CustomerOrders
    GROUP BY customer_id
    ORDER BY COUNT(order_id) DESC
    LIMIT 1
);

SELECT 
    c.name AS Customer,
    p.product_name AS Product,
    o.quantity,
    o.total_amount,
    o.order_date
FROM CustomerOrders o
JOIN Customers c ON o.customer_id = c.customer_id
JOIN Products1 p ON o.product_id = p.product_id
ORDER BY o.order_date DESC;

