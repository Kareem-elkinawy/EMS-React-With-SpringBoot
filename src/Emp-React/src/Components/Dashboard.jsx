// Components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';
import PrimarySearchAppBar from './PrimarySearchAppBar';

const EMPLOYEE_API_URL = import.meta.env.VITE_EMPLOYEE_API_URL;

const Dashboard = ({setLogin,Login}) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_EMPLOYEE_API_URL}/ems/EmployeeDetail`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error.response ? error.response.data : error.message);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleAddOrUpdateEmployee = async (employee) => {
    try {
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_EMPLOYEE_API_URL}/ems/UpdateEmployee/${employee.id}`, employee);
      } else {
        await axios.post(`${import.meta.env.VITE_EMPLOYEE_API_URL}/ems/AddEmployee`, employee);
      }
      fetchEmployees();
      setIsEditing(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error adding/updating employee:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_EMPLOYEE_API_URL}/ems/DeleteEmployee/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <PrimarySearchAppBar setLogin={setLogin} Login={Login}/>
      <h1 className='font-[Montserrat] font-extralight text-center text-4xl tracking-wider mt-[2rem] underline'>Employee Management System</h1>
      <EmployeeList
        employees={employees}
        onSelectEmployee={handleSelectEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />
      <EmployeeForm
        employee={selectedEmployee}
        onAddOrUpdateEmployee={handleAddOrUpdateEmployee}
        setIsEditing={setIsEditing}
      />
      {selectedEmployee && !isEditing && (
        <EmployeeDetail employee={selectedEmployee} />
      )}
    </div>
  );
};

export default Dashboard;
