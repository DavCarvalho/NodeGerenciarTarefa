const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found!"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
    const { username, name } = request.body;

    const userAlreadyExist = users.find(user => user.username === username);

    if(userAlreadyExist){
      return response.status(400).json({error: "User already Exist"});
    }

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    }
  
    users.push(user);
  
    return response.status(201).json(user);
});

app.get('/users',checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const id = uuidv4();

  const todosTitle = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todosTitle);

  return response.status(201).json(todosTitle);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const {id} = request.params;

  const todosId =  user.todos.find(todosId => todosId.id === id);

  if(todosId){
    todosId.title = title;
    todosId.deadline = new Date(deadline);
  } else {
    return response.status(404).json({error: "id doesn't exist"});
  }
  
  return response.json(todosId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todosId = user.todos.find(todosId => todosId.id === id);

  if(todosId){
    todosId.done = true;
  } else {
    return response.status(404).json({error: "id doesn't exist"});
  }

  return response.json(todosId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todosId = user.todos.findIndex(todosId => todosId.id === id);

  if (todosId === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todosId,1);

  return response.status(204).send();
});

module.exports = app;
