package com.example.service;

import com.example.entry.Attendance;
import com.example.repository.AttendanceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository repo;

    public Attendance punchIn(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (!repo.findByEmployeeIdAndDate(employeeId, today).isEmpty()) {
            throw new RuntimeException("Already punched in today");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setDate(today);
        attendance.setPunchIn(now);
        attendance.setStatus(now.isBefore(LocalTime.of(9, 0)) ? "present" : "late");

        return repo.save(attendance);
    }

    public Attendance punchOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = repo.findByEmployeeIdAndDate(employeeId, today)
                                    .stream().findFirst()
                                    .orElseThrow(() -> new RuntimeException("No punch in found"));

        if (attendance.getPunchOut() != null) {
            throw new RuntimeException("Already punched out");
        }

        LocalTime now = LocalTime.now();
        attendance.setPunchOut(now);
        Duration duration = Duration.between(attendance.getPunchIn(), now);
        attendance.setHoursWorked(duration.toMinutes() / 60.0);

        return repo.save(attendance);
    }

    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return repo.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return repo.findByDate(date);
    }

	
}
