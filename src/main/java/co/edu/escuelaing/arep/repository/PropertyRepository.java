package co.edu.escuelaing.arep.repository;

import co.edu.escuelaing.arep.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByAddressContainingIgnoreCase(String address);

    List<Property> findByPriceLessThanEqual(BigDecimal maxPrice);

    List<Property> findByPriceGreaterThanEqual(BigDecimal minPrice);

    List<Property> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    List<Property> findBySizeLessThanEqual(Double maxSize);

    List<Property> findBySizeGreaterThanEqual(Double minSize);

    List<Property> findBySizeBetween(Double minSize, Double maxSize);

    @Query("SELECT p FROM Property p WHERE " +
            "(:address IS NULL OR LOWER(p.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:minSize IS NULL OR p.size >= :minSize) AND " +
            "(:maxSize IS NULL OR p.size <= :maxSize)")
    Page<Property> searchProperties(
            String address,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minSize,
            Double maxSize,
            Pageable pageable);
}