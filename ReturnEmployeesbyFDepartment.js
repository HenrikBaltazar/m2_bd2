const { MongoClient } = require("mongodb");

async function getEmployeesByDepartment(deptName) {
  const client = new MongoClient("mongodb://root:root@localhost:27017/");

  try {
    await client.connect();
    const db = client.db("employees");

    const employees = await db.collection("employees")
      .find(
        { "departments.dept_name": deptName },
        { projection: { first_name: 1, last_name: 1, departments: 1, _id: 0 } }
      )
      .toArray();

    console.log(`Employees in department "${deptName}":`);
    employees.forEach(e => {
      console.log(`${e.first_name} ${e.last_name}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

//TESTE
getEmployeesByDepartment("Development");
