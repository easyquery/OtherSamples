package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.sap.olingo.jpa.metadata.core.edm.annotation.EdmIgnore;

import java.sql.Date;

import javax.persistence.Column;

@Entity(name = "Employee")
@Table(name = "Employees")
public class Employee {

    @Id
    @Column(name = "EmployeeID")
    private int iD;

    @Column(name = "LastName")
    private String lastName;

    @Column(name = "FirstName")
    private String firstName;

    @Column(name = "Title")
    private String title;

    @Column(name = "TitleOfCourtesy")
    private String titleOfCourtesy;

    @Column(name = "BirthDate")
    private Date birthDate;

    @Column(name = "HireDate")
    private Date hireDate;

    @Column(name = "Address")
    private String address;

    @Column(name = "City")
    private String city;

    @Column(name = "Region")
    private String region;

    @Column(name = "PostalCode")
    private String postalCode;

    @Column(name = "Country")
    private String country;

    @Column(name = "HomePhone")
    private String homePhone;

    @Column(name = "Extension")
    private String extension;

    @EdmIgnore()
    @Column(name = "Notes")
    private String notes;

    @Column(name = "ReportsTo")
    private Integer reportsTo;

    @ManyToOne
    @JoinColumn(name = "ReportsTo", insertable = false, updatable = false)
    private Employee manager;

    public Employee() {
        super();
    }
    
}