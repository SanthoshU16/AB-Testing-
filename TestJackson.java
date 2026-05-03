import com.fasterxml.jackson.databind.ObjectMapper;
public class TestJackson {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        com.armorbridge.armor_bridge.model.PhishingTemplate t = new com.armorbridge.armor_bridge.model.PhishingTemplate();
        t.setIsDefault(true);
        t.setName("Test");
        System.out.println(mapper.writeValueAsString(t));
    }
}
