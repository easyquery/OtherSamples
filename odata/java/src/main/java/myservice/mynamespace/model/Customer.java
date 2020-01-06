package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import javax.persistence.Column;

@Entity(name = "Customer")
@Table(name = "Customers")
public class Customer {

    @Id
    @Column(name = "CustomerID")
    private String iD;

    @Column(name = "CompanyName")
    private String companyName;

    @Column(name = "ContactName")
    private String contactName;

    @Column(name = "ContactTitle")
    private String contactTitle;

    @Column(name = "TitleOfCourtesy")
    private String titleOfCourtesy;

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

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Fax")
    private String fax;

    public Customer() {
        super();
    }
    
}