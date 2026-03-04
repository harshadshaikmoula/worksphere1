package com.example.service;

import com.example.entry.User;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(String name, String email, String password, String confirmPassword, String role, String department) {
        if (userRepository.existsByEmail(email)) {
            return "Email already registered!";
        }

        if (!password.equals(confirmPassword)) {
            return "Passwords do not match!";
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); 
        user.setRole(role);
        user.setDepartment(department);

        userRepository.save(user);
        return "SUCCESS";
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
