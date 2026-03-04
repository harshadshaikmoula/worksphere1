package com.example.entry;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private LocalDate date;

    private LocalTime punchIn;
    private LocalTime punchOut;

    private String status; // present, late, absent

    private Double hoursWorked;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(Long employeeId) {
		this.employeeId = employeeId;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public LocalTime getPunchIn() {
		return punchIn;
	}

	public void setPunchIn(LocalTime punchIn) {
		this.punchIn = punchIn;
	}

	public LocalTime getPunchOut() {
		return punchOut;
	}

	public void setPunchOut(LocalTime punchOut) {
		this.punchOut = punchOut;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Double getHoursWorked() {
		return hoursWorked;
	}

	public void setHoursWorked(Double hoursWorked) {
		this.hoursWorked = hoursWorked;
	}

    
}
