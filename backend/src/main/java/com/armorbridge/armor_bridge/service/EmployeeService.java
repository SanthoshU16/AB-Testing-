package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.Employee;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class EmployeeService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION = "employees";

    public List<Employee> getAllEmployees() throws ExecutionException, InterruptedException {
        List<Employee> employees = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        for (QueryDocumentSnapshot document : documents) {
            Employee emp = document.toObject(Employee.class);
            emp.setId(document.getId());
            employees.add(emp);
        }
        return employees;
    }

    public Employee getEmployeeById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot document = firestore.collection(COLLECTION).document(id).get().get();
        if (document.exists()) {
            Employee emp = document.toObject(Employee.class);
            if (emp != null) emp.setId(document.getId());
            return emp;
        }
        return null;
    }

    public String createEmployee(Employee employee) throws ExecutionException, InterruptedException {
        long now = System.currentTimeMillis();
        employee.setCreatedAt(now);
        employee.setUpdatedAt(now);
        ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(employee);
        return future.get().getId();
    }

    public void deleteEmployee(String id) {
        firestore.collection(COLLECTION).document(id).delete();
    }

    public void uploadMultipleEmployees(List<Employee> employees) throws ExecutionException, InterruptedException {
        WriteBatch batch = firestore.batch();
        long now = System.currentTimeMillis();
        for (Employee emp : employees) {
            emp.setCreatedAt(now);
            emp.setUpdatedAt(now);
            DocumentReference docRef = firestore.collection(COLLECTION).document();
            batch.set(docRef, emp);
        }
        batch.commit().get();
    }

    public void deleteAllEmployees() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        WriteBatch batch = firestore.batch();
        for (QueryDocumentSnapshot document : documents) {
            batch.delete(document.getReference());
        }
        batch.commit().get();
    }
}
