package myservice.mynamespace.model;

import java.io.Serializable;

import javax.persistence.Column;

public class OrderDetailId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "OrderID")
    private int orderId;

    @Column(name = "ProductID")
    private int productId;

    public OrderDetailId(){
        super();
    }

    public OrderDetailId(int orderId, int productId) {
        this.orderId = orderId;
        this.productId = productId;
    }
    
}