package co.edu.escuelaing.arep;

import co.edu.escuelaing.arep.controller.PropertyController;
import co.edu.escuelaing.arep.model.Property;
import co.edu.escuelaing.arep.service.PropertyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@SpringBootTest
class PropertyManagementApplicationTests {

    final String BASE_URL = "http://localhost:8080/api/properties";

    @MockBean
    private PropertyService propertyService;

    @Autowired
    private PropertyController propertyController;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = standaloneSetup(propertyController).build();
    }

    @Test
    void contextLoads() {
    }

    @Test
    public void testSaveNewProperty() throws Exception {
        Property property = new Property("Calle 93 EXAMPLE", new BigDecimal("10"), 10.0, "EXAMPLE");
        property.setId(1L);
        when(propertyService.createProperty(any())).thenReturn(property);

        // JSON de la propiedad enviada para que coincida con la entidad
        String json = "{\"address\":\"Calle 93 EXAMPLE\",\"price\":10,\"size\":10,\"description\":\"EXAMPLE\"}";

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        verify(propertyService, times(1)).createProperty(any());
    }

    @Test
    public void testUpdateExistingProperty() throws Exception {
        // Simulación de propiedad existente
        Property existingProperty = new Property("Calle 93 ORIGINAL", new BigDecimal("1200000"), 100.0, "Original description");
        existingProperty.setId(2L);

        // Simulación de propiedad actualizada
        Property updatedProperty = new Property("Calle 93 UPDATED", new BigDecimal("1500000"), 130.0, "Updated description");
        updatedProperty.setId(2L);

        // JSON para enviar en la petición PUT
        String json = "{\"address\":\"Calle 93 UPDATED\",\"price\":1500000,\"size\":130,\"description\":\"Updated description\"}";

        // Mock del servicio para devolver la propiedad actualizada
        when(propertyService.updateProperty(eq(2L), any(Property.class))).thenReturn(updatedProperty);

        // Ejecutar el test de actualización
        mockMvc.perform(put(BASE_URL + "/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        // Verificar que el método update fue llamado exactamente una vez
        verify(propertyService, times(1)).updateProperty(eq(2L), any(Property.class));
    }

    @Test
    public void testDeleteExistingProperty() throws Exception {
        // No es necesario configurar un mock de findById ya que el controlador
        // maneja internamente los errores y llama directamente a deleteProperty
        doNothing().when(propertyService).deleteProperty(2L);

        mockMvc.perform(delete(BASE_URL + "/2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(propertyService, times(1)).deleteProperty(2L);
    }

    @Test
    public void testGetAllProperties() throws Exception {
        // Preparar datos de prueba
        List<Property> properties = Arrays.asList(
                createProperty(1L, "Calle 123", new BigDecimal("150000"), 100.0, "Bonita casa"),
                createProperty(2L, "Avenida 456", new BigDecimal("200000"), 120.0, "Apartamento amplio")
        );
        Page<Property> page = new PageImpl<>(properties, PageRequest.of(0, 10), properties.size());

        // Configurar comportamiento mock
        when(propertyService.getAllPropertiesPaginated(0, 10)).thenReturn(page);

        // Ejecutar y verificar
        mockMvc.perform(get(BASE_URL)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());

        verify(propertyService, times(1)).getAllPropertiesPaginated(0, 10);
    }

    @Test
    public void testGetPropertyById() throws Exception {
        // Preparar datos de prueba
        Property property = createProperty(1L, "Calle 123", new BigDecimal("150000"), 100.0, "Bonita casa");

        when(propertyService.getPropertyById(1L)).thenReturn(property);

        // Ejecutar y verificar
        mockMvc.perform(get(BASE_URL + "/1"))
                .andExpect(status().isOk());

        verify(propertyService, times(1)).getPropertyById(1L);
    }

    @Test
    public void testSearchProperties() throws Exception {
        // Preparar datos de prueba
        List<Property> properties = Arrays.asList(
                createProperty(1L, "Calle 123", new BigDecimal("150000"), 100.0, "Bonita casa")
        );
        Page<Property> page = new PageImpl<>(properties, PageRequest.of(0, 10), properties.size());

        // Configurar comportamiento mock
        when(propertyService.searchProperties(
                eq("Calle"),
                eq(new BigDecimal("100000")),
                eq(new BigDecimal("200000")),
                eq(80.0),
                eq(120.0),
                eq(0),
                eq(10)))
                .thenReturn(page);

        // Ejecutar y verificar
        mockMvc.perform(get(BASE_URL + "/search")
                        .param("address", "Calle")
                        .param("minPrice", "100000")
                        .param("maxPrice", "200000")
                        .param("minSize", "80")
                        .param("maxSize", "120")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());

        verify(propertyService, times(1)).searchProperties(
                eq("Calle"),
                eq(new BigDecimal("100000")),
                eq(new BigDecimal("200000")),
                eq(80.0),
                eq(120.0),
                eq(0),
                eq(10));
    }

    private Property createProperty(Long id, String address, BigDecimal price, Double size, String description) {
        Property property = new Property(address, price, size, description);
        property.setId(id);
        return property;
    }
}