package co.edu.escuelaing.arep.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Se requiere la dirección")
    @Column(nullable = false)
    private String address;

    @NotNull(message = "Se requiere precio")
    @Positive(message = "El precio debe ser un número positivo")
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull(message = "Se requiere tamaño")
    @Positive(message = "El tamaño debe ser un número positivo")
    @Column(nullable = false)
    private Double size;

    @Column(length = 1000)
    private String description;

    public Property() {
    }

    public Property(String address, BigDecimal price, Double size, String description) {
        this.address = address;
        this.price = price;
        this.size = size;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "Property [id=" + id + ", address=" + address + ", price=" + price + ", size=" + size + ", description="
                + description + "]";
    }
}