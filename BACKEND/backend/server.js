require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;
const USERS_FILE = "users.json";

// Function to safely read users from JSON file
const readUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return []; // If file doesn't exist, return an empty array
        }
        const data = fs.readFileSync(USERS_FILE, "utf8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
};

// Function to safely write users to JSON file
const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing users.json:", error);
    }
};

// 🔹 Customer Registration (Stores in users.json)
app.post("/customer/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let users = readUsers();

        // Check if the email already exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = { name, email, password: hashedPassword };

        users.push(newUser); // Add new user to array
        writeUsers(users); // Save updated array to file

        res.json({ message: "Customer registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error processing request" });
    }
});

// 🔹 Customer Login (Reads from users.json)
app.post("/customer/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const users = readUsers();
        const validCustomer = users.find(user => user.email === email);

        if (validCustomer) {
            const match = await bcrypt.compare(password, validCustomer.password);
            if (match) {
                return res.json({ message: "Customer login successful!", success: true });
            }
        }
        res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
        res.status(500).json({ message: "Error processing request" });
    }
});

const ORDERS_FILE = "orders.json";

// Function to read orders from file
const readOrders = () => {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            return []; // If file doesn't exist, return an empty array
        }
        const data = fs.readFileSync(ORDERS_FILE, "utf8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading orders.json:", error);
        return [];
    }
};

// Function to write orders to file
const writeOrders = (orders) => {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing orders.json:", error);
    }
};

// 🔹 Place Order Endpoint
app.post("/place-order", (req, res) => {
    const orderData = req.body;

    if (!orderData.firstName || !orderData.email || !orderData.cartItems || orderData.cartItems.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    try {
        let orders = readOrders();

        // Assign a unique order ID
        const newOrder = {
            id: orders.length + 1,
            ...orderData
        };

        orders.push(newOrder);
        writeOrders(orders);

        res.json({ message: "Order placed successfully!", orderId: newOrder.id });
    } catch (error) {
        res.status(500).json({ message: "Error processing order" });
    }
});

const MESSAGES_FILE = "messages.json";
const readMessages = () => {
    try {
        if (!fs.existsSync(MESSAGES_FILE)) {
            return [];
        }
        const data = fs.readFileSync(MESSAGES_FILE, "utf8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading messages.json:", error);
        return [];
    }
};

// Function to write messages
const writeMessages = (messages) => {
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing messages.json:", error);
    }
};

// 🔹 Contact Form Handler
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let messages = readMessages();
        const newMessage = { name, email, message, date: new Date().toISOString() };
        messages.push(newMessage);
        writeMessages(messages);

        res.json({ message: "Message received successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error saving message" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
