import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080", // ✅ Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
});

// EMPLOYEE API
export const fetchEmployees = () => api.get("/employees");

export const getEmployeeById = (id: string) =>
  api.get(`/employees/${id}`);

export const addEmployee = (data: unknown) =>
  api.post("/employees", data);

export const deleteEmployee = (id: number) =>
  api.delete(`/employees/${id}`);


// ATTENDANCE API

export const fetchAllAttendance = () => api.get("/attendance");

export const fetchAttendanceByEmployee = (employeeId: string) =>
  api.get(`/attendance/employee/${employeeId}`);

export const fetchAttendanceByDate = (date: string) =>
  api.get(`/attendance/date/${date}`);

export const punchIn = (employeeId: string) =>
  api.post(`/attendance/punch-in`, { employeeId });

export const punchOut = (employeeId: string) =>
  api.post(`/attendance/punch-out`, { employeeId });

export const fetchMonthlySummary = (employeeId: string) =>
  api.get(`/attendance/monthly-summary/${employeeId}`); // ⚠️ Make sure this is implemented in Spring Boot
