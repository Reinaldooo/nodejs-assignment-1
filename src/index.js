const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find(user => user.username === username);
  if(!user) {
    return res.status(404).json({ error: "Invalid request." });
  }
  req.user = user;
  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;
  if (!name || !username) {
    return res.status(400).json({ error: "You must send all required fields." });
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: "Invalid request." });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return res.status(201).json(newUser);
});

app.use(checksExistsUserAccount);

app.get("/todos", (req, res) => {
  return res.status(200).json(req.user.todos);
});

app.post("/todos", (req, res) => {
  const { title, deadline } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ error: "You must send all required fields." });
  }
  const newTodo = { 
    id: uuidv4(),
    title,
    deadline: new Date(deadline), 
    done: false, 
    created_at: new Date()
  };
  req.user.todos.push(newTodo);
  return res.status(201).json(newTodo);
});

app.put("/todos/:id", (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  if (!title || !deadline || !id) {
    return res.status(400).json({ error: "You must send all required fields." });
  }
  const updatedTodo = req.user.todos.find(todo => todo.id === id);
  if (!updatedTodo) {
    return res.status(404).json({ error: "Invalid request." });
  }
  updatedTodo.title = title;
  updatedTodo.deadline = new Date(deadline);
  return res.status(201).json(updatedTodo);
});

app.patch("/todos/:id/done", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "You must send all required fields." });
  }
  const updatedTodo = req.user.todos.find(todo => todo.id === id);
  if (!updatedTodo) {
    return res.status(404).json({ error: "Invalid request." });
  }
  updatedTodo.done = true;
  return res.status(201).json(updatedTodo);
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "You must send all required fields." });
  }
  const todoIdx = req.user.todos.findIndex(todo => todo.id === id);
  if (todoIdx < 0) {
    return res.status(404).json({ error: "Invalid request." });
  }
  req.user.todos.splice(todoIdx, 1);
  return res.status(204).json(todoIdx);
});

module.exports = app;
