const { MongoClient } = require("mongodb");

async function getAverageSalaryByDepartment() {
  const client = new MongoClient("mongodb://root:root@localhost:27017/");

  try {
    await client.connect();
    const db = client.db("employees");

    const result = await db.collection("employees").aggregate([
      { $unwind: "$departments" },
      { $unwind: "$salaries" },
      {
        $match: {
          "salaries.to_date": "9999-01-01"  //Apenas salário atual
        }
      },
      {
        $group: {
          _id: "$departments.dept_name",
          averageSalary: { $avg: "$salaries.salary" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          averageSalary: { $round: ["$averageSalary", 2] },
          totalEmployees: "$count"
        }
      },
      { $sort: { department: 1 } }
    ]).toArray();

    console.log("Média salarial por departamento:");
    result.forEach(dep => {
      console.log(`${dep.department}: $${dep.averageSalary} (${dep.totalEmployees} funcionários)`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

getAverageSalaryByDepartment();
