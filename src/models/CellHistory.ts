type PropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>;

/*
  $deleted: true removes cell completly
  string: undefined deletes property
*/
type CellState = Record<string, PropertyValue> & { id: string };
export type CellPatch = Partial<CellState> & { id: string };

interface HistoryStep {
  forward: CellPatch[];
  backward: CellPatch[];
}

export default class CellHistory {
  private currentState: Map<string, CellState>;
  private history: HistoryStep[];
  private currentIndex: number;

  constructor() {
    this.currentState = new Map();
    this.history = [];
    this.currentIndex = -1;
  }

  private deepClone<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private applyPatchToCell(
    current: CellState | undefined,
    patch: CellPatch,
  ): CellState {
    const newState = current ? this.deepClone(current) : { id: patch.id };

    for (const [key, value] of Object.entries(patch)) {
      if (key === "id") continue;

      if (value === undefined) {
        delete newState[key];
      } else if (value !== null && typeof value === "object") {
        newState[key] = { ...((newState[key] as object) || {}), ...value };
      } else {
        newState[key] = value;
      }
    }

    return newState as CellState;
  }

  private generateBackwardPatch(
    id: string,
    currentState: CellState | undefined,
  ): CellPatch {
    if (!currentState) {
      return { id, $deleted: true };
    }

    const patch: CellPatch = { id };
    for (const key in currentState) {
      if (key !== "id") {
        patch[key] = currentState[key];
      }
    }
    return patch;
  }

  applyStep(patches: CellPatch[]): void {
    const changesMap = new Map<string, CellPatch>();
    const backwardPatches: CellPatch[] = [];
    const forwardPatches: CellPatch[] = [];

    // преобразуем в Map, чтобы учитывать только последние изменения,
    // если есть несколько изменений для одной клетки
    patches.forEach((patch) => {
      const existing = changesMap.get(patch.id) || { id: patch.id };
      changesMap.set(patch.id, { ...existing, ...patch });
    });

    changesMap.forEach((patch, id) => {
      const current = this.currentState.get(id);

      backwardPatches.push(this.generateBackwardPatch(id, current));

      if (patch.$deleted) {
        this.currentState.delete(id);
      } else {
        const newState = this.applyPatchToCell(current, patch);
        this.currentState.set(id, newState);
      }

      forwardPatches.push({ ...patch });
    });

    // нужно чтобы начать новую ветку изменений после нескольких undo
    this.history = this.history.slice(0, this.currentIndex + 1);

    this.currentIndex++;
    this.history[this.currentIndex] = {
      forward: forwardPatches,
      backward: backwardPatches,
    };
  }

  applyMultipleSteps(arrayOfsteps: CellPatch[][]): void {
    const flattened = arrayOfsteps.flat();

    this.applyStep(flattened);
  }

  undo(): void {
    if (this.currentIndex < 0) return;

    const step = this.history[this.currentIndex].backward;

    // Восстанавливаем предыдущее состояние
    step.forEach((patch) => {
      if (patch.$deleted) {
        this.currentState.delete(patch.id);
      } else {
        this.currentState.set(patch.id, { ...patch } as CellState);
      }
    });

    this.currentIndex--;
  }

  redo(): void {
    if (this.currentIndex >= this.history.length - 1) return;

    this.currentIndex++;
    const step = this.history[this.currentIndex].forward;

    step.forEach((patch) => {
      const current = this.currentState.get(patch.id);

      if (patch.$deleted) {
        this.currentState.delete(patch.id);
      } else {
        this.currentState.set(patch.id, this.applyPatchToCell(current, patch));
      }
    });
  }

  getState(): Map<string, CellState> {
    const clonedMap = new Map<string, CellState>();
    this.currentState.forEach((value, key) => {
      clonedMap.set(key, this.deepClone(value));
    });
    return clonedMap;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.currentState.clear();
  }

  get historyIndex() {
    return this.currentIndex;
  }

  get historyCurrentStep() {
    return this.history[this.historyIndex]; // как сделать иммутабельным?
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  isEmpty() {
    return this.history.length === 0;
  }

  getLastPropertyChange(
    cellId: string,
    propertyName: string,
  ): { value: PropertyValue; stepIndex: number } | null {
    for (let i = this.currentIndex; i >= 0; i--) {
      const step = this.history[i];

      const patch = step.forward.find((p) => p.id === cellId);

      if (patch && propertyName in patch) {
        return {
          value: patch[propertyName],
          stepIndex: i,
        };
      }
    }

    return null;
  }
}
