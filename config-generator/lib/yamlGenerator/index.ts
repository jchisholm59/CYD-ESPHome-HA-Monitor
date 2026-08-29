import type {
  ConfigData,
  SensorConfig,
  BinarySensorConfig,
  InputBooleanSensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";
import { generateHeader } from "./header";
import { generateSubstitutions, getAllPrefixedSensors } from "./substitutions";
import { generateBoilerplate } from "./boilerplate";
import { generateLvglConfig } from "./lvgl";
import {
  generateBinarySensorConfig,
  generateSwitchSensorConfig,
} from "./onOffSensors";
import { generateNumericSensorConfig, generateTextValueSensorConfig } from "./numericSensors";
import { generateLightConfig } from "./light";
import { migrateConfig } from "@/lib/useLocalStorageConfig";

export function generateYaml(config: ConfigData): string {
  const migrated = migrateConfig(config);
  const { hideClock } = migrated;
  const allSensors = getAllPrefixedSensors(migrated);
  const activeSensors = allSensors.filter((s) => s.enabled !== false);
  const getSensor = (id: string): SensorConfig | undefined =>
    allSensors.find((s) => s.id === id);

  const binarySensors = activeSensors.filter(
    (s): s is BinarySensorConfig => s.type === "binary",
  );
  const lightSensors = activeSensors.filter(
    (s): s is LightSensorConfig => s.type === "light",
  );
  const switchSensors = activeSensors.filter(
    (s): s is SwitchSensorConfig => s.type === "switch",
  );
  const inputBooleanSensors = activeSensors.filter(
    (s): s is InputBooleanSensorConfig => s.type === "input_boolean",
  );

  return (
    generateHeader() +
    generateSubstitutions(migrated, allSensors, getSensor) +
    generateBoilerplate(migrated) +
    generateLvglConfig(allSensors, getSensor, hideClock ?? false, migrated.buttonRadius ?? 0, migrated.screens) +
    generateBinarySensorConfig(binarySensors, lightSensors, inputBooleanSensors) +
    generateSwitchSensorConfig(switchSensors) +
    generateLightConfig() +
    generateTextValueSensorConfig(activeSensors) +
    generateNumericSensorConfig(activeSensors)
  );
}