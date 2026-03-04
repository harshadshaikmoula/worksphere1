package com.example.controller;

import com.example.entry.Attendance;
import com.example.service.AttendanceService;
import com.example.dto.AttendanceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService service;

    @PostMapping("/punch-in")
    public ResponseEntity<Attendance> punchInJson(@RequestBody AttendanceRequest request) {
        Attendance attendance = service.punchIn(request.getEmployeeId());
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/punch-out")
    public ResponseEntity<Attendance> punchOutJson(@RequestBody AttendanceRequest request) {
        Attendance attendance = service.punchOut(request.getEmployeeId());
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getByEmployee(@PathVariable Long employeeId) {
        return service.getAttendanceByEmployee(employeeId);
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getByDate(@PathVariable String date) {
        return service.getAttendanceByDate(LocalDate.parse(date));
    }
}
