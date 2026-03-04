package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entry.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long>{

}
