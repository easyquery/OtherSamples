package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.sql.Date;

import javax.persistence.Column;

@Entity(name = "Order")
@Table(name = "Orders")
public class Order {

    @Id
    @Column(name = "OrderID")
    private int iD;

    @Column(name = "CustomerID")
    private String customerId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "EmployeeID")
    private Integer employeeId;

    @ManyToOne
    @JoinColumn(name = "EmployeeID", insertable = false, updatable = false)
    private Employee employee;

    @Column(name = "OrderDate")
    private Date orderDate;

    @Column(name = "RequiredDate")
    private Date requiredDate;

    @Column(name = "ShippedDate")
    private Date shippedDate;

    @Column(name = "ShipVia")
    private Integer shipVia;

    @Column(name = "Freight")
    private double freight; 

    @Column(name = "ShipName")
    private String shipName; 

    @Column(name = "ShipAddress")
    private String shipAddress; 

    @Column(name = "ShipCity")
    private String shipCity; 

    @Column(name = "ShipRegion")
    private String shipRegion; 

    @Column(name = "ShipPostalCode")
    private String shipPostalCode; 

    @Column(name = "ShipCountry")
    private String shipCountry; 

    @Column(name = "Paid")
    private int paid; 

    public Order() {
        super();
    }
    
}