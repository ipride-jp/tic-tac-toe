import * as React from 'react';
import { MarkType } from "./constant";
const BUTTON_STYLE = { fontSize: 40, height: 50, width: 50 }

export const BoardButton: React.FC<{
  mark: MarkType, onClick: () => void
}> = ({mark, onClick}) => (
  <button style={BUTTON_STYLE} onClick={onClick}>{mark}</button>
);
