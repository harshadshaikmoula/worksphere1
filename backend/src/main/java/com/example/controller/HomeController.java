package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

    @RequestMapping({
        "/", 
        "/{path:^(?!api|login|register|logout|error).*$}", 
        "/**/{path:^(?!api|login|register|logout|error).*$}"
    })
    public String forwardSPA() {
        return "forward:/index.html";
    }
}
