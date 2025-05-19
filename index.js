const { Employee: MongoEmployee, departments: MongoDepartments } = require('./mongo_model');
const { sequelize, Employee: MySQLEmployee, Salary, Titles, Departments, Dept_Emp, Dept_manager } = require('./mysql_model');
const { MongoClient } = require('mongodb');

const uri = "mongodb://root:root@localhost:27017/";
const client = new MongoClient(uri);

function groupBy(array, key) {
  return array.reduce((acc, obj) => {
    const value = obj[key];
    if (!acc[value]) acc[value] = [];
    acc[value].push(obj);
    return acc;
  }, {});
}

const populateData = async () => {
  try {
    console.log("Carregando dados do MySQL");

    const [employeesRaw, salariesRaw, titlesRaw, deptEmpRaw, departmentsRaw, deptManagersRaw] = await Promise.all([
      MySQLEmployee.findAll(),
      Salary.findAll(),
      Titles.findAll(),
      Dept_Emp.findAll(),
      Departments.findAll(),
      Dept_manager.findAll()
    ]);

    const employees = employeesRaw.map(e => e.get({ plain: true }));
    const salaries = groupBy(salariesRaw.map(s => s.get({ plain: true })), 'emp_no');
    const titles = groupBy(titlesRaw.map(t => t.get({ plain: true })), 'emp_no');
    const deptEmp = groupBy(deptEmpRaw.map(d => d.get({ plain: true })), 'emp_no');
    const departmentsMap = new Map(departmentsRaw.map(d => [d.dept_no, d.get({ plain: true })]));
    const deptManagers = groupBy(deptManagersRaw.map(d => d.get({ plain: true })), 'dept_no');

    console.log("Construindo objetos para MongoDB");

    const employeesData = employees.map(e => {
      const emp = JSON.parse(JSON.stringify(MongoEmployee));
      emp.emp_no = e.emp_no;
      emp.first_name = e.first_name;
      emp.last_name = e.last_name;
      emp.birth_date = e.birth_date;
      emp.gender = e.gender;
      emp.hire_date = e.hire_date;

      emp.salaries = salaries[e.emp_no] || [];
      emp.titles = titles[e.emp_no] || [];

      const empDepts = deptEmp[e.emp_no] || [];
      emp.departments = empDepts.map(de => {
        const deptDoc = JSON.parse(JSON.stringify(MongoDepartments));
        deptDoc.dept_no = de.dept_no;
        deptDoc.from_date = de.from_date;
        deptDoc.to_date = de.to_date;

        const deptInfo = departmentsMap.get(de.dept_no);
        deptDoc.dept_name = deptInfo ? deptInfo.dept_name : null;

        const managers = deptManagers[de.dept_no] || [];
        const matchingManagers = managers.filter(dm => {
          const empStart = new Date(de.from_date);
          const empEnd = new Date(de.to_date || new Date());
        
          const mgrStart = new Date(dm.from_date);
          const mgrEnd = new Date(dm.to_date || new Date());
        
          return mgrStart <= empEnd && mgrEnd >= empStart;
        });

        deptDoc.dept_managers = matchingManagers.map(m => {
          return {
          emp_no: m.emp_no,
          first_name: "",
          last_name: "",
          from_date: m.from_date,
          to_date: m.to_date};
        });

        return deptDoc;
      });

      return emp;
    });
    const nameLookup = new Map(
      employees.map(e => [e.emp_no, { first_name: e.first_name, last_name: e.last_name }])
    );
    
    for (const emp of employeesData) {
      for (const dept of emp.departments) {
        if (!dept.dept_managers) continue;
    
        dept.dept_managers = dept.dept_managers.map(m => {
          const info = nameLookup.get(m.emp_no);
          return {
            ...m,
            first_name: info?.first_name || "",
            last_name: info?.last_name || ""
          };
        });
      }
    }
    return employeesData;
  } catch (error) {
    console.error("Erro ao montar dados:", error);
    return [];
  }
};

const main = async () => {
  try {
    console.log("Conectando ao MongoDB");
    await client.connect();

    console.log("Removendo banco de dados anterior");
    await client.db('employees').dropDatabase();

    const db = client.db("employees");
    const collection = db.collection("employees");

    console.log("Coletando e convertendo dados do MySQL");
    const data = await populateData();

    if (!Array.isArray(data)) throw new Error("populateData() precisa retornar um array.");

    console.log("Inserindo no MongoDB");
    const result = await collection.insertMany(data.filter(d => d && d.emp_no));
    console.log(`${result.insertedCount} documentos inseridos com sucesso.`);
  } catch (error) {
    console.error("Erro na migração:", error);
  } finally {
    console.log("Encerrando conexão com o MongoDB");
    await client.close();
  }
};

main();
