const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error at ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const hasPriorityStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};
const hasPriority = (query) => {
  return query.priority !== undefined;
};
const hasStatus = (query) => {
  return query.status !== undefined;
};

//get todo
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getQuery = "";
  switch (true) {
    case hasPriorityStatus(request.query):
      getQuery = `select * from todo where todo LIKE "%${search_q}%" and priority LIKE "%${priority}%" and status LIKE "%${status}%";`;
      break;
    case hasPriority(request.query):
      getQuery = `select * from todo where todo LIKE "%${search_q}%" and priority LIKE "%${priority}%";`;
      break;
    case hasStatus(request.query):
      getQuery = `select * from todo where todo LIKE "%${search_q}%" and status LIKE "%${status}%";`;
      break;
    default:
      getQuery = `select * from todo where todo LIKE "%${search_q}%";`;
      break;
  }

  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});
const getTodoIdObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `select * from todo where id = ${todoId};`;
  const dbQuery = await db.get(getQuery);
  response.send(getTodoIdObject(dbQuery));
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getQuery = `insert into todo(
      id, todo, priority, status) values
      ('${id}','${todo}','${priority}','${status}')`;
  const dbQuery = await db.run(getQuery);
  response.send("Todo Successfully Added");
});

const hasStatusObj = (dbObject) => {
  return dbObject.status !== undefined;
};
const hasPriorityObj = (dbObject) => {
  return dbObject.priority !== undefined;
};

const hasTodoObj = (dbObject) => {
  return dbObject.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { status = "", todo = "", priority = "" } = request.body;
  const { todoId } = request.params;
  let getQuery = "";
  let dbQuery = "";
  switch (true) {
    case hasStatusObj(request.body):
      getQuery = `update todo set status = '${status}' where id = ${todoId}`;
      dbQuery = await db.run(getQuery);
      response.send("Status Updated");
      break;

    case hasTodoObj(request.body):
      getQuery = `update todo set todo = '${todo}' where id = ${todoId}`;
      dbQuery = await db.run(getQuery);
      response.send("Todo Updated");
      break;

    case hasPriorityObj(request.body):
      getQuery = `update todo set priority = '${priority}' where id = ${todoId}`;
      dbQuery = await db.run(getQuery);
      response.send("Priority Updated");
      break;

    default:
      //   getQuery = `update todo set priority = '${priority}' where id = ${todoId}`;
      //   dbQuery = await db.run(getQuery);
      //   response.send("Priority Updated");

      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `delete from todo where id = ${todoId};`;
  const dbQuery = await db.run(getQuery);
  response.send("Todo Deleted");
});
module.exports = app;
