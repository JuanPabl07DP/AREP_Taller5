package co.edu.escuelaing.arep.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
import co.edu.escuelaing.arep.model.Property;
import co.edu.escuelaing.arep.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // GET all properties with pagination
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Property> pageProperties = propertyService.getAllPropertiesPaginated(page, size);
        List<Property> properties = pageProperties.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("properties", properties);
        response.put("currentPage", pageProperties.getNumber());
        response.put("totalItems", pageProperties.getTotalElements());
        response.put("totalPages", pageProperties.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // GET property by ID
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        try {
            Property property = propertyService.getPropertyById(id);
            return ResponseEntity.ok(property);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // SEARCH properties with filters
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProperties(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minSize,
            @RequestParam(required = false) Double maxSize,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Property> pageProperties = propertyService.searchProperties(
                address, minPrice, maxPrice, minSize, maxSize, page, size);

        List<Property> properties = pageProperties.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("properties", properties);
        response.put("currentPage", pageProperties.getNumber());
        response.put("totalItems", pageProperties.getTotalElements());
        response.put("totalPages", pageProperties.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // CREATE new property
    @PostMapping
    public ResponseEntity<Property> createProperty(@Valid @RequestBody Property property) {
        Property newProperty = propertyService.createProperty(property);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProperty);
    }

    // UPDATE property
    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @Valid @RequestBody Property property) {
        try {
            Property updatedProperty = propertyService.updateProperty(id, property);
            return ResponseEntity.ok(updatedProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE property
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        try {
            propertyService.deleteProperty(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Handler for validation errors
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}