// Definindo os nomes dos campos como variáveis
const emp_no = "emp_no";
const first_name = "first_name";
const last_name = "last_name";
const birth_date = "birth_date";
const gender = "gender";
const hire_date = "hire_date";

const dept_no = "dept_no";
const dept_name = "dept_name";
const from_date = "from_date";
const to_date = "to_date";
const dept_managers = "dept_managers";

const title = "title";
const salary = "salary";

const departments =
{
    dept_no,
    dept_name,
    from_date,
    to_date,
    dept_managers
}

const titles =
{
    title,
    from_date,
    to_date
};

const salaries =
{
    salary,
    from_date,
    to_date
};

const Employee = {
  emp_no,
  birth_date,
  first_name,
  last_name,
  gender,
  hire_date,
  departments,
  titles,
  salaries
};

module.exports = { Employee, departments, titles, salaries };
