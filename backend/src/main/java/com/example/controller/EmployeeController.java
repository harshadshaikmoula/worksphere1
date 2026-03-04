package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entry.Employee;
import com.example.service.EmployeeService;

@CrossOrigin(origins = "http://localhost:5173") // Important!
@RestController
@RequestMapping("/employees")
public class EmployeeController {
    @Autowired
    private EmployeeService service;

    @GetMapping
    public List<Employee> showAll() {
        return service.getAll();
    }

    @PostMapping
    public Employee add(@RequestBody Employee e) {
        return service.add(e);
    }
}