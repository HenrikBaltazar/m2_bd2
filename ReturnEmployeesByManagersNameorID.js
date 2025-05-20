const { MongoClient } = require("mongodb");

async function getEmployeesByManager(managerInput) {
  const client = new MongoClient("mongodb://root:root@localhost:27017/");

  try {
    await client.connect();
    const db = client.db("employees");

    //Determinar se a entrada é um ID (número) ou um nome (string)
    let query = {};
    if (typeof managerInput === "number") {
      query = { "departments.dept_managers.emp_no": managerInput };
    } else if (typeof managerInput === "string") {
      const [first, last] = managerInput.split(" ");
      query = {
        "departments.dept_managers.first_name": first,
        "departments.dept_managers.last_name": last
      };
    }

    const employees = await db.collection("employees")
      .find(query, { projection: { first_name: 1, last_name: 1, _id: 0 } })
      .toArray();

    console.log(`Employees managed by ${managerInput}:`);
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
//getEmployeesByManager(110511); //Pelo ID

//getEmployeesByManager("DeForest Hagimont"); //Pelo nome
