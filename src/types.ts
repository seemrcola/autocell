export type {
  Cell,
  NeighborPattern,
  AutomatonState,
  Automaton,
  AutomatonOption,
  RunningStatus
}

type RunningStatus = 'stopped' | 'autoplaying';

type Cell = number;
type NeighborPattern = string;

interface AutomatonOption {
  id: string;
  name: string;
  automaton: Automaton;
}

interface AutomatonState {
  desc: string;                                       // 状态描述
  color: string;                                      // 颜色
  default: Cell;                                      // 默认状态
  transitions: Record<NeighborPattern, Cell>;         // 转换规则
}

type Automaton = AutomatonState[];
