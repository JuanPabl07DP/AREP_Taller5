package co.edu.escuelaing.arep.service;

import co.edu.escuelaing.arep.model.Property;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyService {

    List<Property> getAllProperties();

    Page<Property> getAllPropertiesPaginated(int page, int size);

    // Búsqueda de propiedades
    Page<Property> searchProperties(
            String address,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minSize,
            Double maxSize,
            int page,
            int size);

    // Obtener una propiedad por ID
    Property getPropertyById(Long id);

    // Crear una nueva propiedad
    Property createProperty(Property property);

    // Actualizar una propiedad existente
    Property updateProperty(Long id, Property property);

    // Eliminar una propiedad
    void deleteProperty(Long id);

    // Verificar si una propiedad existe
    boolean existsById(Long id);
}