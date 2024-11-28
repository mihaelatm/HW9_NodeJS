import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const users = [];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      email,
      password: hashedPassword,
      role: role || "user",
    });

    console.log(users);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/admin", (req, res) => {
  const { email } = req.query;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied, admin role required" });
  }

  res.status(200).json({ message: "Welcome to the admin area!" });
});

app.post("/change-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/delete-account", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      users[userIndex].password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    users.splice(userIndex, 1);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/change-email", async (req, res) => {
  try {
    const { email, password, newEmail } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const existingEmail = users.find((user) => user.email === newEmail);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    user.email = newEmail;

    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
