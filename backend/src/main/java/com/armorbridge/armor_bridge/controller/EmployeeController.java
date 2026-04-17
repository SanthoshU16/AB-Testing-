package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Employee;
import com.armorbridge.armor_bridge.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public List<Employee> getEmployees() throws ExecutionException, InterruptedException {
        return employeeService.getAllEmployees();
    }

    @PostMapping
    public String addEmployee(@RequestBody Employee employee) throws ExecutionException, InterruptedException {
        return employeeService.createEmployee(employee);
    }

    @PostMapping("/bulk")
    public void addEmployees(@RequestBody List<Employee> employees) throws ExecutionException, InterruptedException {
        employeeService.uploadMultipleEmployees(employees);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
    }
}
