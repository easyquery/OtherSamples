package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import javax.persistence.Column;

@Entity(name = "Product")
@Table(name = "Products")
public class Product {

    @Id
    @Column(name = "ProductID")
    private int iD;

    @Column(name = "ProductName")
    private String productName;

    @Column(name = "SupplierID")
    private Integer supplierID;

    @ManyToOne
    @JoinColumn(name = "SupplierID", insertable = false, updatable = false)
    private Supplier supplier;

    @Column(name = "CategoryID")
    private Integer categoryId;

    @ManyToOne
    @JoinColumn(name = "CategoryID", insertable = false, updatable = false)
    private Category Category;

    @Column(name = "QuantityPerUnit")
    private String quantityPerUnit;

    @Column(name = "UnitPrice")
    private double unitPrice;

    @Column(name = "UnitsInStock")
    private int unitsInStock;

    @Column(name = "UnitsOnOrder")
    private int unitsOnOrder;
    
    @Column(name = "ReorderLevel")
    private int reorderLevel;

    @Column(name = "Discontinued")
    private int discontinued;

    @Column(name = "LastOrder")
    private String lastOrder;
    
    @Column(name = "OnSale")
    private int onSale;

    public Product() {
        super();
    }
    
}