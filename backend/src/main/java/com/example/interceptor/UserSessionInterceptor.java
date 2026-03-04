package com.example.interceptor;

import com.example.entry.User;
import com.example.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.security.Principal;

@Component
public class UserSessionInterceptor implements HandlerInterceptor {

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Principal principal = request.getUserPrincipal();

        HttpSession session = request.getSession(false);

        if (principal != null && (session == null || session.getAttribute("user") == null)) {
            User user = userService.getByEmail(principal.getName());
            request.getSession(true).setAttribute("user", user);
        }

        return true;
    }
}
