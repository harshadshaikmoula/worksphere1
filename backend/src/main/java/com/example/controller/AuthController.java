package com.example.controller;

import com.example.entry.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String registerUser(@RequestParam String name,
                               @RequestParam String email,
                               @RequestParam String password,
                               @RequestParam String confirmPassword,
                               @RequestParam String role,
                               @RequestParam String department,
                               Model model) {
        if (!password.equals(confirmPassword)) {
            model.addAttribute("error", "Passwords do not match");
            return "forward:/index.html"; 
        }

        if (userService.emailExists(email)) {
            model.addAttribute("error", "Email already registered");
            return "forward:/index.html";
        }

        User user = new User(name, email, password, role, department);
        userService.save(user);

        return "redirect:/login"; 
    }
}
