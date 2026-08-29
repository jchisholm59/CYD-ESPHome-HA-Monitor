import { migrateConfig } from "@/lib/useLocalStorageConfig";
import { getAllPrefixedSensors, generateSubstitutions } from "@/lib/yamlGenerator/substitutions";
import { generateYaml } from "@/lib/yamlGenerator";
import { defaultConfig } from "@/lib/defaultConfig";
import type { ConfigData } from "@/types/config";

describe("Multi-screen state and generation", () => {
  it("migrates legacy flat configuration with sensors to screens", () => {
    const legacyConfig: ConfigData = {
      deviceName: "test-device",
      friendlyName: "Test Device",
      deviceVariant: "spi_touch",
      sensors: [
        { id: "r1c1", type: "text", entity: "sensor.test", label: "Test", icon: "icon", iconColor: "0xFFFFFF" }
      ]
    };

    const migrated = migrateConfig(legacyConfig);
    expect(migrated.screens).toBeDefined();
    expect(migrated.screens!.length).toBe(3);
    expect(migrated.screens![0].sensors[0].entity).toBe("sensor.test");
    expect(migrated.screens![1].sensors[0].entity).toBe(""); // unconfigured placeholder
  });

  it("prefixes sensor IDs with screen ID correctly", () => {
    const config: ConfigData = { ...defaultConfig };
    const migrated = migrateConfig(config);
    const prefixed = getAllPrefixedSensors(migrated);

    expect(prefixed.some(s => s.id === "s1_r1c1")).toBe(true);
    expect(prefixed.some(s => s.id === "s2_r1c1")).toBe(true);
    expect(prefixed.some(s => s.id === "s3_r1c1")).toBe(true);
  });

  it("generates correct multi-page YAML with transitions and styles", () => {
    const config: ConfigData = { ...defaultConfig };
    const migrated = migrateConfig(config);
    const yaml = generateYaml(migrated);

    // Verify background color variables are present
    expect(yaml).toContain("s1_bg_color: \"0x0F1419\"");
    expect(yaml).toContain("s2_bg_color: \"0x0F1419\"");
    expect(yaml).toContain("s3_bg_color: \"0x0F1419\"");

    // Verify font color variables are present
    expect(yaml).toContain("s1_font_color: \"0xFFFFFF\"");
    expect(yaml).toContain("s2_font_color: \"0xFFFFFF\"");
    expect(yaml).toContain("s3_font_color: \"0xFFFFFF\"");

    // Verify page IDs exist
    expect(yaml).toContain("id: page_s1");
    expect(yaml).toContain("id: page_s2");
    expect(yaml).toContain("id: page_s3");

    // Verify swipe page transitions exist
    expect(yaml).toContain("on_swipe_left:");
    expect(yaml).toContain("lvgl.page.show:");
    expect(yaml).toContain("animation: MOVE_LEFT");
  });

  it("automatically migrates legacy configs and uses correct lvgl.widget.update color logic", () => {
    const legacyConfig: ConfigData = {
      deviceName: "legacy-device",
      friendlyName: "Legacy Device",
      deviceVariant: "spi_touch",
      sensors: [
        {
          id: "r1c1",
          type: "sensor",
          entity: "sensor.test_temp",
          label: "Temperature",
          icon: "\\ue1ff",
          iconColor: "0x00BFFF",
          format: "%.1f°C",
          thresholds: [
            { value: "30", color: "0xFF0000" }
          ]
        }
      ]
    };

    const yaml = generateYaml(legacyConfig);

    // Verify s2 and s3 colors are generated due to auto-migration
    expect(yaml).toContain("s2_bg_color:");
    expect(yaml).toContain("s3_bg_color:");

    // Verify we use lvgl.widget.update instead of the broken lvgl.label.update for text_color
    expect(yaml).toContain("lvgl.widget.update:");
    expect(yaml).toContain("id: icon_s1_r1c1");
    expect(yaml).toContain("text_color: !lambda |-");
    
    // Ensure we do NOT contain a broken label update with text_color
    const lines = yaml.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("lvgl.label.update:")) {
        // The following lines shouldn't have text_color
        expect(lines[i+1].includes("text_color:")).toBe(false);
        expect(lines[i+2].includes("text_color:")).toBe(false);
      }
    }
  });

  it("generates correct background image configurations with platform: file and bg_image_src", () => {
    const configWithImage: ConfigData = {
      ...defaultConfig,
      screens: [
        {
          id: "s1",
          name: "Screen 1",
          backgroundColor: "#0f1419",
          fontColor: "#ffffff",
          backgroundImage: "images/my_cool_bg.png",
          sensors: []
        },
        {
          id: "s2",
          name: "Screen 2",
          sensors: []
        },
        {
          id: "s3",
          name: "Screen 3",
          sensors: []
        }
      ]
    };

    const yaml = generateYaml(configWithImage);

    // Verify image assets block exists with platform: file
    expect(yaml).toContain("# --- IMAGE ASSETS (Compiled in Flash) ---");
    expect(yaml).toContain("image:");
    expect(yaml).toContain("- platform: file");
    expect(yaml).toContain("file: \"images/my_cool_bg.png\"");
    expect(yaml).toContain("id: s1_bg_image");
    expect(yaml).toContain("resize: 320x240");
    expect(yaml).toContain("type: RGB565");

    // Verify LVGL configuration references the background image correctly via bg_image_src
    expect(yaml).toContain("bg_image_src: s1_bg_image");
  });
});