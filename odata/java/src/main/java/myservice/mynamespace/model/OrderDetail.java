package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import javax.persistence.Column;

@Entity(name = "OrderDetail")
@Table(name = "`Order details`")
@IdClass(OrderDetailId.class)
public class OrderDetail {

    @Id
    private int orderId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderID", insertable = false, updatable = false)
    private Order bill;

    @Id
    private int productId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductID", insertable = false, updatable = false)
    private Product product;

    @Column(name = "UnitPrice")
    private double unitPrice;

    @Column(name = "Quantity")
    private double quantity;

    @Column(name = "Discount")
    private double discount;

    public OrderDetail() {
        super();
    }
    
}