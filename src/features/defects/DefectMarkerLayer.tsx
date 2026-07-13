import { Arrow, Circle, Label, Tag, Text } from "react-konva";
import type { DefectType, PlacedDefect } from "../../types/defect";

type DefectMarkerLayerProps = {
  placedDefects: PlacedDefect[];
  defectTypes: DefectType[];
  pendingPosition?: { x: number; y: number } | null;
  armedDefectTypeId?: string | null;
};

export default function DefectMarkerLayer({
  placedDefects,
  defectTypes,
  pendingPosition = null,
  armedDefectTypeId = null,
}: DefectMarkerLayerProps) {
  const pendingDefectType = pendingPosition
    ? defectTypes.find((type) => type.id === armedDefectTypeId)
    : undefined;

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
      {pendingPosition && pendingDefectType ? (
        <>
          <Circle
            key="pending-marker"
            x={pendingPosition.x}
            y={pendingPosition.y}
            radius={14}
            fill={pendingDefectType.color}
            stroke="white"
            strokeWidth={2}
            opacity={0.6}
          />
          <Text
            key="pending-marker-abbr"
            x={pendingPosition.x - 10}
            y={pendingPosition.y - 7}
            width={20}
            align="center"
            text={pendingDefectType.abbreviation}
            fontSize={10}
            fontStyle="bold"
            fill="white"
            opacity={0.6}
            listening={false}
          />
        </>
      ) : null}
    </>
  );
}
