import { Arrow, Circle, Label, Tag, Text } from "react-konva";
import type { DefectType, PlacedDefect } from "../../types/defect";

type DefectMarkerLayerProps = {
  placedDefects: PlacedDefect[];
  defectTypes: DefectType[];
};

export default function DefectMarkerLayer({ placedDefects, defectTypes }: DefectMarkerLayerProps) {
  return (
    <>
      {placedDefects.map((defect) => {
        const defectType = defectTypes.find((type) => type.id === defect.defectTypeId);
        if (!defectType) return null;

        return (
          <Arrow
            key={`${defect.id}-arrow`}
            points={[defect.labelPosition.x, defect.labelPosition.y, defect.position.x, defect.position.y]}
            stroke={defectType.color}
            fill={defectType.color}
            strokeWidth={2}
            pointerLength={8}
            pointerWidth={8}
            listening={false}
          />
        );
      })}
      {placedDefects.map((defect) => {
        const defectType = defectTypes.find((type) => type.id === defect.defectTypeId);
        if (!defectType) return null;

        return (
          <Circle
            key={defect.id}
            x={defect.position.x}
            y={defect.position.y}
            radius={14}
            fill={defectType.color}
            stroke="white"
            strokeWidth={2}
          />
        );
      })}
      {placedDefects.map((defect) => {
        const defectType = defectTypes.find((type) => type.id === defect.defectTypeId);
        if (!defectType) return null;

        return (
          <Text
            key={`${defect.id}-abbr`}
            x={defect.position.x - 10}
            y={defect.position.y - 7}
            width={20}
            align="center"
            text={defectType.abbreviation}
            fontSize={10}
            fontStyle="bold"
            fill="white"
            listening={false}
          />
        );
      })}
      {placedDefects.map((defect) => {
        const defectType = defectTypes.find((type) => type.id === defect.defectTypeId);
        if (!defectType) return null;

        return (
          <Label
            key={`${defect.id}-label`}
            x={defect.labelPosition.x}
            y={defect.labelPosition.y}
            listening={false}
          >
            <Tag
              fill="white"
              stroke={defectType.color}
              strokeWidth={1}
              cornerRadius={4}
              shadowColor="black"
              shadowOpacity={0.15}
              shadowBlur={4}
              shadowOffsetY={1}
            />
            <Text text={defectType.name} fontSize={12} fontStyle="bold" fill="#1e293b" padding={4} />
          </Label>
        );
      })}
    </>
  );
}
