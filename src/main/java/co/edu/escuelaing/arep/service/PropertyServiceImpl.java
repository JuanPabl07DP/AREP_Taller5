package co.edu.escuelaing.arep.service;

import java.math.BigDecimal;
import java.util.List;
import co.edu.escuelaing.arep.model.Property;
import co.edu.escuelaing.arep.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;

    @Autowired
    public PropertyServiceImpl(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Override
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @Override
    public Page<Property> getAllPropertiesPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return propertyRepository.findAll(pageable);
    }

    @Override
    public Page<Property> searchProperties(
            String address,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minSize,
            Double maxSize,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);
        return propertyRepository.searchProperties(address, minPrice, maxPrice, minSize, maxSize, pageable);
    }

    @Override
    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
    }

    @Override
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }

    @Override
    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = getPropertyById(id);

        // Actualizar los campos
        property.setAddress(propertyDetails.getAddress());
        property.setPrice(propertyDetails.getPrice());
        property.setSize(propertyDetails.getSize());
        property.setDescription(propertyDetails.getDescription());

        // Guardar los cambios
        return propertyRepository.save(property);
    }

    @Override
    public void deleteProperty(Long id) {
        Property property = getPropertyById(id);
        propertyRepository.delete(property);
    }

    @Override
    public boolean existsById(Long id) {
        return propertyRepository.existsById(id);
    }
}