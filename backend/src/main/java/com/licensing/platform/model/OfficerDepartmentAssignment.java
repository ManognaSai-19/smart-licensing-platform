package com.licensing.platform.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "officer_department_assignments",
       uniqueConstraints = @UniqueConstraint(name = "uq_officer_department", columnNames = {"user_id", "department_id"}))
public class OfficerDepartmentAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt = Instant.now();

    public OfficerDepartmentAssignment() {
    }

    public OfficerDepartmentAssignment(User user, Department department) {
        this.user = user;
        this.department = department;
        this.assignedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OfficerDepartmentAssignment that)) return false;
        return Objects.equals(user, that.user) && Objects.equals(department, that.department);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, department);
    }
}
