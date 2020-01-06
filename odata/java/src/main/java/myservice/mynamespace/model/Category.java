package myservice.mynamespace.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.sap.olingo.jpa.metadata.core.edm.annotation.EdmIgnore;

import javax.persistence.Column;

@Entity(name = "Category")
@Table(name = "Categories")
public class Category {

    @Id
    @Column(name = "CategoryID")
    private String iD;

    @Column(name = "CategoryName")
    private String categoryName;

    @Column(name = "Description")
    private String description;

    @EdmIgnore()
    @Column(name = "IconFileName")
    private String iconFileName;

    public Category() {
        super();
    }
    
}