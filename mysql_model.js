const { Sequelize, DataTypes } = require('sequelize');

const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "root";
const DATABASE = "employees";

const sequelize = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
    host: MYSQL_IP,
    dialect: "mysql",
    pool: {
        max: 100,
        min: 0,
        acquire: 10 * 60 * 1000,  // tempo em milissegundos (30s)
        idle: 10000
      },
    dialectOptions: {
        connectTimeout: 10 * 60 * 1000
    }
});

const Employee = sequelize.define('Employee', {
    emp_no: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false, unique: true },
    birth_date: { type: DataTypes.DATE, allowNull: false },
    first_name: { type: DataTypes.STRING(14), allowNull: false },
    last_name: { type: DataTypes.STRING(16), allowNull: false },
    gender: { type: DataTypes.ENUM('M','F'), allowNull: false },
    hire_date: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'employees', timestamps: false });

const Salary = sequelize.define('Salaries', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true },
    salary: { type: DataTypes.INTEGER, allowNull: false },
    from_date: { type: DataTypes.DATE, primaryKey: true, allowNull: false, unique: true },
    to_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'salaries', timestamps: false });

const Titles = sequelize.define('Titles', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true },
    title: { type: DataTypes.STRING(50), primaryKey: true, allowNull: false, unique: true },
    from_date: { type: DataTypes.DATE, primaryKey: true, allowNull: false, unique: true },
    to_date: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'titles', timestamps: false });

const Departments = sequelize.define('Departments', {
    dept_no: { type: DataTypes.STRING(4), primaryKey: true, allowNull: false, unique: true },
    dept_name: { type: DataTypes.STRING(40), allowNull: false, unique: true }
}, { tableName: 'departments', timestamps: false });

const Dept_Emp = sequelize.define('Dept_Emp', {
    dept_no: { type: DataTypes.STRING(4), primaryKey: true, allowNull: false, unique: true },
    emp_no: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true },
    from_date: { type: DataTypes.DATE, allowNull: false },
    to_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'dept_emp', timestamps: false });

const Dept_manager = sequelize.define('Dept_Manager', {
    dept_no: { type: DataTypes.STRING(4), primaryKey: true, allowNull: false, unique: true },
    emp_no: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true },
    from_date: { type: DataTypes.DATE, allowNull: false },
    to_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'dept_manager', timestamps: false });

Dept_Emp.belongsTo(Employee, { foreignKey: 'emp_no' });
Dept_Emp.belongsTo(Departments, { foreignKey: 'dept_no' });
Dept_manager.belongsTo(Employee, { foreignKey: 'emp_no' });
Dept_manager.belongsTo(Departments, { foreignKey: 'dept_no' });
Salary.belongsTo(Employee, {foreignKey: 'emp_no'});
Titles.belongsTo(Employee, {foreignKey: 'emp_no'});

module.exports = { sequelize, Employee, Salary, Titles, Departments, Dept_Emp, Dept_manager };
